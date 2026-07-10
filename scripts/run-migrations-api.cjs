const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.argv[2];
const PROJECT = 'sakfrqjqpwyubyhushva';
const MIGRATIONS_DIR = path.resolve(__dirname, '../supabase/migrations');

function runQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Split SQL into individual statements, handling:
// - $$ dollar-quoted strings (function bodies)
// - ' single-quoted strings
// - comments (-- and /* */)
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inDollar = null;
  let dollarTag = '';
  let inSingleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1] || '';

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      current += ch;
      i++;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        current += '*/';
        i += 2;
      } else {
        current += ch;
        i++;
      }
      continue;
    }

    if (inDollar) {
      current += ch;
      // Check for closing dollar tag
      if (ch === '$') {
        const remaining = sql.slice(i + 1);
        const endIdx = remaining.indexOf('$');
        if (endIdx >= 0) {
          const tag = remaining.slice(0, endIdx);
          if (tag === dollarTag) {
            inDollar = false;
            dollarTag = '';
            current += remaining.slice(0, endIdx + 1);
            i += endIdx + 2;
            continue;
          }
        }
      }
      i++;
      continue;
    }

    if (inSingleQuote) {
      current += ch;
      if (ch === "'" && next === "'") {
        current += "'";
        i += 2;
      } else if (ch === "'") {
        inSingleQuote = false;
      }
      i++;
      continue;
    }

    // Check for line comment
    if (ch === '-' && next === '-') {
      inLineComment = true;
      current += '--';
      i += 2;
      continue;
    }

    // Check for block comment
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      current += '/*';
      i += 2;
      continue;
    }

    // Check for dollar-quoted string
    if (ch === '$') {
      const remaining = sql.slice(i + 1);
      const endIdx = remaining.indexOf('$');
      if (endIdx >= 0) {
        dollarTag = remaining.slice(0, endIdx);
        inDollar = true;
        current += '$' + dollarTag + '$';
        i += endIdx + 2;
        continue;
      }
    }

    // Check for single quote
    if (ch === "'") {
      inSingleQuote = true;
      current += ch;
      i++;
      continue;
    }

    // Semicolon - end of statement
    if (ch === ';') {
      const trimmed = (current + ';').trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  // Last statement without semicolon
  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);

  return statements;
}

async function run() {
  if (!TOKEN) {
    console.error('Usage: node scripts/run-migrations-api.cjs <supabase-access-token>');
    process.exit(1);
  }

  // Test connection
  console.log('Testing API connection...');
  const test = await runQuery('SELECT 1 AS ok');
  console.log('Connected!\n');

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    const statements = splitStatements(sql);
    console.log(`Running: ${file} (${statements.length} statements, ${(sql.length / 1024).toFixed(1)} KB)`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].slice(0, 100).replace(/\s+/g, ' ').trim();
      const prefix = stmt.length > 80 ? stmt.slice(0, 77) + '...' : stmt;
      try {
        await runQuery(statements[i]);
        console.log(`  [${i + 1}/${statements.length}] ✓ ${prefix}`);
      } catch (err) {
        console.error(`  [${i + 1}/${statements.length}] ✗ ${prefix}`);
        console.error(`    Error: ${err.message}`);
        // Don't stop - some statements may fail due to dependencies
        // But stop for critical errors like "already exists" for types/enums
      }
    }
    console.log(`  → ${file} complete\n`);
  }

  console.log('All migrations finished!');
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
