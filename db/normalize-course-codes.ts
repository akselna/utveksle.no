import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local
try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.warn("Could not read .env.local file, assuming environment variables are set.");
}

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function normalize() {
  const client = await pool.connect();

  try {
    console.log("Starting course code normalization...");
    await client.query('BEGIN');

    // 1. Fetch all approved_courses that might need normalization
    // (containing spaces in ntnu_course_code or exchange_course_code)
    const res = await client.query(`
      SELECT * FROM approved_courses
      WHERE ntnu_course_code LIKE '% %'
         OR exchange_course_code LIKE '% %'
    `);

    console.log(`Found ${res.rows.length} courses with spaces to normalize.`);

    let updatedCount = 0;
    let deletedCount = 0;

    for (const row of res.rows) {
      const oldNtnuCode = row.ntnu_course_code;
      const oldExchangeCode = row.exchange_course_code;
      
      const newNtnuCode = oldNtnuCode.replace(/\s+/g, '').toUpperCase();
      const newExchangeCode = oldExchangeCode.replace(/\s+/g, '').toUpperCase();

      if (newNtnuCode === oldNtnuCode && newExchangeCode === oldExchangeCode) {
        continue; // Should not happen given the WHERE clause, but safety first
      }

      console.log(`Processing ID ${row.id}: "${oldNtnuCode}" -> "${newNtnuCode}", "${oldExchangeCode}" -> "${newExchangeCode}"`);

      // 2. Ensure the normalized NTNU course exists in ntnu_courses
      await client.query(`
        INSERT INTO ntnu_courses (code, name, credits)
        SELECT $1, name, credits FROM ntnu_courses WHERE code = $2
        ON CONFLICT (code) DO NOTHING
      `, [newNtnuCode, oldNtnuCode]);
      
      // If the old code wasn't in ntnu_courses (integrity issue?), try to find it or just insert a dummy? 
      // Actually approved_courses references ntnu_courses, so it MUST exist.
      // But if we are changing the code, we need to make sure the NEW code exists.
      // The INSERT ... SELECT ... covers the case where we copy details from the old code.
      // If the new code already exists, we do nothing (keep existing details).

      // 3. Check if a conflicting row already exists in approved_courses
      // (Same university, same normalized NTNU code, same normalized exchange code)
      const conflictCheck = await client.query(`
        SELECT id FROM approved_courses
        WHERE ntnu_course_code = $1
          AND exchange_university = $2
          AND exchange_course_code = $3
          AND id != $4
      `, [newNtnuCode, row.exchange_university, newExchangeCode, row.id]);

      if (conflictCheck.rows.length > 0) {
        // Conflict exists. The normalized version is already there.
        // We should DELETE this "spaced" row.
        // OPTIONAL: We could merge data (e.g. if this row is verified and the other isn't), 
        // but for simplicity and safety against bad merges, we'll just delete the duplicate 
        // (assuming the normalized one or the one we keep is fine).
        // Or better: Prefer keeping the one that is already normalized if it exists.
        
        console.log(`  -> Duplicate found (ID ${conflictCheck.rows[0].id}). Deleting ID ${row.id}.`);
        await client.query(`DELETE FROM approved_courses WHERE id = $1`, [row.id]);
        deletedCount++;
      } else {
        // No conflict. We can update this row.
        console.log(`  -> No duplicate. Updating ID ${row.id}.`);
        await client.query(`
          UPDATE approved_courses
          SET ntnu_course_code = $1,
              exchange_course_code = $2
          WHERE id = $3
        `, [newNtnuCode, newExchangeCode, row.id]);
        updatedCount++;
      }
    }

    // 4. Clean up ntnu_courses
    // Delete ntnu codes that have spaces and are no longer referenced by approved_courses
    console.log("Cleaning up unused NTNU courses with spaces...");
    const deleteRes = await client.query(`
      DELETE FROM ntnu_courses
      WHERE code LIKE '% %'
        AND code NOT IN (SELECT ntnu_course_code FROM approved_courses)
    `);
    
    console.log(`Deleted ${deleteRes.rowCount} unused NTNU courses with spaces.`);

    await client.query('COMMIT');
    console.log(`Normalization complete. Updated: ${updatedCount}, Deleted: ${deletedCount}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Normalization failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

normalize();
