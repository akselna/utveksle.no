import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addUsersTable() {
  const client = await pool.connect();

  try {
    console.log('🚀 Adding users table...\n');

    const sql = fs.readFileSync(path.join(process.cwd(), 'db/add-users-table.sql'), 'utf-8');
    await client.query(sql);

    console.log('✅ Users table created successfully!\n');

    // Verify table
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📋 Users table columns:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error adding users table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addUsersTable().catch(console.error);
