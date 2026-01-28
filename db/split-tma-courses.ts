import { Pool } from "pg";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function splitTMACourses() {
  const client = await pool.connect();

  try {
    console.log("Finding all TMA courses...");

    // Get all courses with ntnu_course_code = 'TMA'
    const result = await client.query(
      "SELECT * FROM approved_courses WHERE ntnu_course_code = 'TMA'"
    );

    console.log(`Found ${result.rows.length} TMA courses to split`);

    if (result.rows.length === 0) {
      console.log("No TMA courses found, nothing to do");
      return;
    }

    // Start transaction
    await client.query("BEGIN");

    let created = 0;

    for (const course of result.rows) {
      console.log(
        `Splitting: ${course.exchange_university} - ${course.exchange_course_code}`
      );

      // Create TMA4130 version
      await client.query(
        `
        INSERT INTO approved_courses (
          ntnu_course_code,
          ntnu_course_name,
          exchange_university,
          exchange_country,
          exchange_course_code,
          exchange_course_name,
          ects,
          semester,
          verified,
          wiki_url,
          approval_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (ntnu_course_code, exchange_university, exchange_course_code) DO NOTHING
      `,
        [
          "TMA4130",
          course.ntnu_course_name || "Matematikk 4K",
          course.exchange_university,
          course.exchange_country,
          course.exchange_course_code,
          course.exchange_course_name,
          course.ects,
          course.semester,
          course.verified,
          course.wiki_url,
          course.approval_date,
        ]
      );

      // Create TMA4135 version
      await client.query(
        `
        INSERT INTO approved_courses (
          ntnu_course_code,
          ntnu_course_name,
          exchange_university,
          exchange_country,
          exchange_course_code,
          exchange_course_name,
          ects,
          semester,
          verified,
          wiki_url,
          approval_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (ntnu_course_code, exchange_university, exchange_course_code) DO NOTHING
      `,
        [
          "TMA4135",
          course.ntnu_course_name || "Matematikk 4D",
          course.exchange_university,
          course.exchange_country,
          course.exchange_course_code,
          course.exchange_course_name,
          course.ects,
          course.semester,
          course.verified,
          course.wiki_url,
          course.approval_date,
        ]
      );

      created += 2;
    }

    // Delete original TMA courses
    await client.query("DELETE FROM approved_courses WHERE ntnu_course_code = 'TMA'");

    // Commit transaction
    await client.query("COMMIT");

    console.log(`✓ Split complete: Created ${created} new courses (${created/2} × 2)`);
    console.log(`✓ Deleted ${result.rows.length} original TMA courses`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error splitting TMA courses:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

splitTMACourses();
