import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateExchangePlans() {
  const client = await pool.connect();

  try {
    console.log('🚀 Updating exchange_plans table...\n');

    const sql = fs.readFileSync(path.join(process.cwd(), 'db/update-exchange-plans.sql'), 'utf-8');
    await client.query(sql);

    console.log('✅ Exchange plans table updated successfully!\n');

    // Verify column exists
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'exchange_plans' AND column_name = 'plan_name'
    `);

    if (result.rows.length > 0) {
      console.log('📋 New column added:');
      console.log(`   - ${result.rows[0].column_name}: ${result.rows[0].data_type}`);
    }

  } catch (error) {
    console.error('❌ Error updating exchange plans table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateExchangePlans().catch(console.error);
