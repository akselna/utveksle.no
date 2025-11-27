import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addExperiencesTable() {
  const client = await pool.connect();

  try {
    console.log('🚀 Adding experiences table...\n');

    const sql = fs.readFileSync(path.join(process.cwd(), 'db/add-experiences-table.sql'), 'utf-8');
    await client.query(sql);

    console.log('✅ Experiences table created successfully!\n');

    // Verify table
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'experiences'
    `);

    if (result.rows.length > 0) {
      console.log('📋 Created table:');
      console.log(`   - ${result.rows[0].table_name}`);
    }

  } catch (error) {
    console.error('❌ Error adding experiences table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addExperiencesTable().catch(console.error);
