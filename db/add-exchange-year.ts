import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addExchangeYear() {
  const client = await pool.connect();

  try {
    console.log('🚀 Adding exchange_year column...\n');

    const sql = fs.readFileSync(path.join(process.cwd(), 'db/add-exchange-year.sql'), 'utf-8');
    await client.query(sql);

    console.log('✅ Exchange year column added successfully!\n');

  } catch (error) {
    console.error('❌ Error adding exchange year column:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addExchangeYear().catch(console.error);
