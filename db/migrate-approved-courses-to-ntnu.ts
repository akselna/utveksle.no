import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateApprovedCoursesToNtnu() {
  const client = await pool.connect();

  try {
    console.log('🚀 Migrerer NTNU-kurs fra approved_courses til ntnu_courses...\n');

    // Hent alle unike NTNU kurskoder fra approved_courses
    const result = await client.query(`
      SELECT DISTINCT
        ntnu_course_code,
        ntnu_course_name
      FROM approved_courses
      WHERE ntnu_course_code IS NOT NULL
      ORDER BY ntnu_course_code
    `);

    console.log(`📋 Fant ${result.rows.length} unike NTNU-kurs i approved_courses\n`);

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const course of result.rows) {
      const code = course.ntnu_course_code;
      const name = course.ntnu_course_name;

      // Hopp over hvis kurskode eller navn mangler
      if (!code || !name) {
        skippedCount++;
        console.log(`⚠️  Hoppet over: Mangler kurskode eller navn`);
        continue;
      }

      try {
        // Sjekk om kurset allerede finnes
        const existingCourse = await client.query(
          'SELECT code, name, credits FROM ntnu_courses WHERE code = $1',
          [code]
        );

        if (existingCourse.rows.length > 0) {
          // Kurs finnes allerede - oppdater navnet hvis det er forskjellig
          const existing = existingCourse.rows[0];
          if (existing.name !== name) {
            await client.query(
              'UPDATE ntnu_courses SET name = $1 WHERE code = $2',
              [name, code]
            );
            updatedCount++;
            console.log(`🔄 Oppdatert: ${code} - ${name} (var: ${existing.name})`);
          } else {
            skippedCount++;
            console.log(`✓  Finnes allerede: ${code} - ${name}`);
          }
        } else {
          // Legg til nytt kurs med 7.5 ECTS som standard
          await client.query(
            'INSERT INTO ntnu_courses (code, name, credits) VALUES ($1, $2, $3)',
            [code, name, 7.5]
          );
          addedCount++;
          console.log(`✅ Lagt til: ${code} - ${name} (7.5 ECTS)`);
        }
      } catch (error: any) {
        errors.push(`${code}: ${error.message}`);
        console.log(`❌ Feil ved ${code}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Oppsummering:');
    console.log('='.repeat(60));
    console.log(`   ✅ Nye kurs lagt til: ${addedCount}`);
    console.log(`   🔄 Kurs oppdatert: ${updatedCount}`);
    console.log(`   ✓  Eksisterende (ingen endring): ${skippedCount}`);
    console.log(`   ❌ Feil: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Feil som oppstod:');
      errors.forEach(err => console.log(`   - ${err}`));
    }

    // Vis total antall kurs
    const countResult = await client.query('SELECT COUNT(*) FROM ntnu_courses');
    console.log(`\n📚 Totalt antall NTNU-kurs i databasen: ${countResult.rows[0].count}`);

    // Verifiser at alle kurs i approved_courses nå har en gyldig referanse
    const orphanedResult = await client.query(`
      SELECT COUNT(*) as count
      FROM approved_courses ac
      LEFT JOIN ntnu_courses nc ON ac.ntnu_course_code = nc.code
      WHERE nc.code IS NULL
    `);

    const orphanedCount = parseInt(orphanedResult.rows[0].count);
    if (orphanedCount > 0) {
      console.log(`\n⚠️  Advarsel: ${orphanedCount} kurs i approved_courses har ingen match i ntnu_courses`);

      // Vis eksempler på orphaned kurs
      const orphanedExamples = await client.query(`
        SELECT DISTINCT ntnu_course_code, ntnu_course_name
        FROM approved_courses ac
        LEFT JOIN ntnu_courses nc ON ac.ntnu_course_code = nc.code
        WHERE nc.code IS NULL
        LIMIT 5
      `);

      console.log('   Eksempler:');
      orphanedExamples.rows.forEach(row => {
        console.log(`   - ${row.ntnu_course_code}: ${row.ntnu_course_name}`);
      });
    } else {
      console.log('\n✅ Alle kurs i approved_courses har nå en gyldig referanse i ntnu_courses!');
    }

  } catch (error) {
    console.error('❌ Feil ved migrering:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateApprovedCoursesToNtnu().catch(console.error);
