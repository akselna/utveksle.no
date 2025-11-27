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

async function checkBologna() {
  try {
    const client = await pool.connect();
    console.log('Connected.');

    console.log('\n--- Checking exchange plans for Italy/Bologna ---');
    const plansRes = await client.query(`
      SELECT * FROM exchange_plans 
      WHERE country = 'Italy' OR university_name ILIKE '%Bologna%'
    `);
    console.log(plansRes.rows);

    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkBologna();
