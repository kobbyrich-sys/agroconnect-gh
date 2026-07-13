import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.sakfrqjqpwyubyhushva',
  password: 'agroconnect_db_pass_2026',
  max: 1,
});

// Get the user we created
const userRes = await pool.query(
  `SELECT id, email, encrypted_password FROM auth.users WHERE email LIKE 'test-reg-%' ORDER BY created_at DESC LIMIT 1`
);
const user = userRes.rows[0];
console.log('User:', user.email);
console.log('Hash:', user.encrypted_password);

// Test if password matches
const testRes = await pool.query(
  `SELECT crypt('testpass123', $1) = $1 AS match`,
  [user.encrypted_password]
);
console.log('Password match:', testRes.rows[0].match);

// Also test what crypt generates for a fresh hash
const freshRes = await pool.query(
  `SELECT crypt('testpass123', gen_salt('bf', 10)) AS new_hash`
);
console.log('Fresh hash:', freshRes.rows[0].new_hash);

await pool.end();
