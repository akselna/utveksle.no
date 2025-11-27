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

async function fixAndCheck() {
  try {
    const client = await pool.connect();
    console.log('Connected.');

    // 1. Check what we have for Bologna
    console.log('--- Current Bologna Plans ---');
    const res1 = await client.query(`
      SELECT id, university_name, semester, exchange_year, plan_name 
      FROM exchange_plans 
      WHERE university_name ILIKE '%Bologna%'
    `);
    console.log(res1.rows);

    // 2. Fix the one that looks like it should be Spring 2026
    // Look for one created recently or with 2026 year
    const target = res1.rows.find(r => r.exchange_year === 2026);
    if (target) {
        console.log(`
Updating Plan ID ${target.id} to Semester: 'Vår'...`);
        await client.query(`
            UPDATE exchange_plans 
            SET semester = 'Vår' 
            WHERE id = $1
        `, [target.id]);
        console.log("Update complete.");
    } else {
        console.log("\nNo Bologna plan found for 2026 to update.");
    }

    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

fixAndCheck();
