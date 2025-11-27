// Simple test script to verify database connection
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Heroku Postgres!');

    const res = await client.query('SELECT NOW()');
    console.log('📅 Current database time:', res.rows[0].now);

    // List all tables
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('📊 Tables in database:', tables.rows);

    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
}

testConnection();
