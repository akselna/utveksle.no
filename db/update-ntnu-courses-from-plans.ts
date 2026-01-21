import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ekstraher alle unike NTNU-kurs fra fagplan-dataene
// Dette inkluderer alle kurs fra Datateknologi, Kybernetikk, og Indøk-programmene
const ntnuCoursesFromPlans = [
  // Kybernetikk - manglende kurs
  { code: 'HMS0002', name: 'HMS-kurs for 1. årsstudenter', credits: 0 },
  { code: 'TDT4110', name: 'Informasjonsteknologi, grunnkurs', credits: 7.5 },
  { code: 'TMA4101', name: 'Matematikk 1', credits: 7.5 },
  { code: 'TTK4100', name: 'Kybernetikk, introduksjon', credits: 7.5 },
  { code: 'TDT4102', name: 'Prosedyre- og objektorientert programmering', credits: 7.5 },
  { code: 'TMA4106', name: 'Matematikk 2', credits: 7.5 },
  { code: 'TMA4245', name: 'Statistikk', credits: 7.5 },
  { code: 'TTK4101', name: 'Instrumentering og måleteknikk', credits: 7.5 },
  { code: 'TFY4115', name: 'Fysikk', credits: 7.5 },
  { code: 'TMA4111', name: 'Matematikk 3', credits: 7.5 },
  { code: 'TTK4111', name: 'Reguleringsteknikk', credits: 7.5 },
  { code: 'TMA4121', name: 'Matematikk 4', credits: 7.5 },
  { code: 'TTK4235', name: 'Tilpassede datasystemer', credits: 7.5 },
  { code: 'TTK4240', name: 'Industriell elektroteknikk', credits: 7.5 },
  { code: 'TTK4115', name: 'Lineær systemteori', credits: 7.5 },
  { code: 'TTK4145', name: 'Sanntidsprogrammering', credits: 7.5 },
  { code: 'TTK4150', name: 'Ulineære systemer', credits: 7.5 },
  { code: 'TTK4215', name: 'Adaptiv regulering', credits: 7.5 },
  { code: 'TTK4210', name: 'Avansert regulering av industrielle prosesser', credits: 7.5 },
  { code: 'BI2065', name: 'Akvakultur', credits: 7.5 },
  { code: 'BI3061', name: 'Biologisk oseanografi', credits: 7.5 },
  { code: 'BI3067', name: 'Akvakulturøkologi', credits: 7.5 },
  { code: 'TTK4270', name: 'Biomedisinsk instrumentering og regulering', credits: 7.5 },
  { code: 'TTT4120', name: 'Digital signalbehandling', credits: 7.5 },
  { code: 'TTK4260', name: 'Multivariat dataanalyse og maskinlæring', credits: 7.5 },
  { code: 'MEDT4161', name: 'Medisinsk Ultralydavbildning', credits: 7.5 },
  { code: 'TTK4147', name: 'Sanntidssystemer', credits: 7.5 },
  { code: 'TTK4155', name: 'Industrielle og innbygde datasystemers konstruksjon', credits: 7.5 },

  // Valgfrie fag som ikke var i listen
  { code: 'Valgbart emne', name: 'Valgbart emne', credits: 7.5 },
  { code: 'Valgbart emne (Teknisk)', name: 'Valgbart emne (Teknisk)', credits: 7.5 },
  { code: 'Valgbart emne (Annet)', name: 'Valgbart emne (Annet)', credits: 7.5 },
  { code: 'Valgbart emne (Teknisk 1)', name: 'Valgbart emne (Teknisk)', credits: 7.5 },
  { code: 'Valgbart emne (Teknisk 2)', name: 'Valgbart emne (Teknisk)', credits: 7.5 },
  { code: 'Valgbart emne 1', name: 'Valgbart emne', credits: 7.5 },
  { code: 'Valgbart emne 2', name: 'Valgbart emne', credits: 7.5 },
  { code: 'Valgbart emne 3', name: 'Valgbart emne', credits: 7.5 },
];

async function updateNtnuCourses() {
  const client = await pool.connect();

  try {
    console.log('🚀 Oppdaterer NTNU-kurs fra fagplan-data...\n');

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const course of ntnuCoursesFromPlans) {
      try {
        const result = await client.query(
          `INSERT INTO ntnu_courses (code, name, credits)
           VALUES ($1, $2, $3)
           ON CONFLICT (code) DO UPDATE SET
             name = EXCLUDED.name,
             credits = EXCLUDED.credits
           RETURNING (xmax = 0) AS inserted`,
          [course.code, course.name, course.credits]
        );

        if (result.rows[0].inserted) {
          addedCount++;
          console.log(`✅ Lagt til: ${course.code} - ${course.name}`);
        } else {
          updatedCount++;
          console.log(`🔄 Oppdatert: ${course.code} - ${course.name}`);
        }
      } catch (error: any) {
        skippedCount++;
        console.log(`⚠️  Hoppet over: ${course.code} - ${error.message}`);
      }
    }

    console.log('\n📊 Oppsummering:');
    console.log(`   ✅ Lagt til: ${addedCount} kurs`);
    console.log(`   🔄 Oppdatert: ${updatedCount} kurs`);
    console.log(`   ⚠️  Hoppet over: ${skippedCount} kurs`);

    // Vis total antall kurs
    const countResult = await client.query('SELECT COUNT(*) FROM ntnu_courses');
    console.log(`\n📚 Totalt antall NTNU-kurs i databasen: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Feil ved oppdatering av NTNU-kurs:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateNtnuCourses().catch(console.error);
