const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manual .env parsing
try {
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.log('Could not read .env.local', e);
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    const client = await pool.connect();
    console.log('Connected.');

    const sqlPath = path.join(__dirname, 'db', 'add-contact-requests.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Running migration:', sqlPath);
    await client.query(sql);
    console.log('Migration completed.');

    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

runMigration();
