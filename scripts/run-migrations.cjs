const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION_STRING = process.argv[2];
const MIGRATIONS_DIR = path.resolve(__dirname, '../supabase/migrations');

async function run() {
  if (!CONNECTION_STRING) {
    console.error('Usage: node scripts/run-migrations.cjs <connection-string>');
    process.exit(1);
  }

  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`Running: ${file} (${(sql.length / 1024).toFixed(1)} KB)`);

      await client.query(sql);
      console.log(`  ✓ ${file} completed`);
    }

    console.log('\nAll migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
