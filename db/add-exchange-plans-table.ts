import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addExchangePlansTable() {
  const client = await pool.connect();

  try {
    console.log('🚀 Adding exchange plans tables...\n');

    const sql = fs.readFileSync(path.join(process.cwd(), 'db/add-exchange-plans-table.sql'), 'utf-8');
    await client.query(sql);

    console.log('✅ Exchange plans tables created successfully!\n');

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('exchange_plans', 'saved_courses')
      ORDER BY table_name
    `);

    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error adding exchange plans tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addExchangePlansTable().catch(console.error);
