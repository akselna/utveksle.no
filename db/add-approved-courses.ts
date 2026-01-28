import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log("Starting approved_courses migration...");

    // Read and execute the SQL schema
    const sqlPath = join(__dirname, "add-approved-courses.sql");
    const sql = readFileSync(sqlPath, "utf8");
    await client.query(sql);
    console.log("✓ Created approved_courses table");

    // Read cleaned JSON data
    const jsonPath = join(__dirname, "..", "data", "approved_courses_cleaned.json");
    const jsonData = JSON.parse(readFileSync(jsonPath, "utf8"));

    console.log(`Found ${jsonData.length} courses to migrate`);

    // Insert courses from JSON
    let inserted = 0;
    let skipped = 0;

    for (const course of jsonData) {
      try {
        // Use Bologna fields if available, otherwise fall back to Foreign fields
        const exchangeCode =
          course.Bologna_Emnekode || course.Foreign_Emnekode;
        const exchangeName = course.Bologna_Fagnavn || course.Foreign_Fagnavn || "";

        // Only require exchange code, name is optional
        if (!exchangeCode) {
          console.warn(`Skipping course - missing exchange code:`, course);
          skipped++;
          continue;
        }

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
          ON CONFLICT (ntnu_course_code, exchange_university, exchange_course_code) DO UPDATE SET
            ntnu_course_name = EXCLUDED.ntnu_course_name,
            exchange_country = EXCLUDED.exchange_country,
            exchange_course_name = EXCLUDED.exchange_course_name,
            ects = EXCLUDED.ects,
            semester = EXCLUDED.semester,
            verified = EXCLUDED.verified,
            wiki_url = EXCLUDED.wiki_url,
            approval_date = EXCLUDED.approval_date,
            updated_at = CURRENT_TIMESTAMP
        `,
          [
            course.NTNU_Emnekode,
            course.NTNU_Fagnavn || "",
            course.University,
            course.Country,
            exchangeCode,
            exchangeName,
            parseFloat(course.ECTS) || 7.5,
            course.Semester || null,
            course.verified === true,
            course.Wiki_URL || null,
            course.Behandlingsdato || null,
          ]
        );

        inserted++;
      } catch (err: any) {
        console.error(`Error inserting course:`, course, err.message);
        skipped++;
      }
    }

    console.log(`✓ Migration complete: ${inserted} inserted/updated, ${skipped} skipped`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
