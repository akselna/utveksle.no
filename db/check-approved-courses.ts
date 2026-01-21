import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function check() {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT COUNT(*) FROM approved_courses");
    console.log(`Total approved_courses in database: ${result.rows[0].count}`);

    const sampleResult = await client.query("SELECT * FROM approved_courses LIMIT 5");
    console.log("\nSample courses:");
    console.log(sampleResult.rows);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

check();
