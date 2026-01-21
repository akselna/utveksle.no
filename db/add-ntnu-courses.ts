import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addNtnuCoursesTable() {
  const client = await pool.connect();

  try {
    console.log('🚀 Adding and seeding NTNU courses table...\n');

    const sql = fs.readFileSync(path.join(process.cwd(), 'db/add-ntnu-courses.sql'), 'utf-8');
    await client.query(sql);

    console.log('✅ NTNU courses table created and seeded successfully!\n');

    // Verify table
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'ntnu_courses'
      ORDER BY ordinal_position
    `);

    console.log('📋 NTNU courses table columns:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });
    
    // Verify count
    const countResult = await client.query('SELECT COUNT(*) FROM ntnu_courses');
    console.log(`\n📊 Total courses: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error adding NTNU courses table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addNtnuCoursesTable().catch(console.error);
