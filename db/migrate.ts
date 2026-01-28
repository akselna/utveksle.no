import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Import JSON data
const universityCoordinates = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public/extracted-data/university-coordinates.json'), 'utf-8')
);

const allExchanges = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'extracted-data/all-exchanges.json'), 'utf-8')
);

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database migration...\n');

    // Read and execute schema
    console.log('📋 Creating tables...');
    const schema = fs.readFileSync(path.join(process.cwd(), 'db/schema.sql'), 'utf-8');
    await client.query(schema);
    console.log('✅ Tables created successfully\n');

    // Insert universities
    console.log('🏫 Inserting universities...');
    let universityCount = 0;
    const universityIdMap: { [key: string]: number } = {};

    for (const [name, data] of Object.entries(universityCoordinates) as any) {
      const result = await client.query(
        `INSERT INTO universities (name, latitude, longitude, country, continent, city)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO UPDATE SET
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           country = EXCLUDED.country,
           continent = EXCLUDED.continent,
           city = EXCLUDED.city
         RETURNING id`,
        [name, data.lat, data.lng, data.country, data.continent, data.city]
      );
      universityIdMap[name] = result.rows[0].id;
      universityCount++;
    }
    console.log(`✅ Inserted ${universityCount} universities\n`);

    // Insert exchange agreements and courses
    console.log('📚 Inserting exchange agreements and courses...');
    let exchangeCount = 0;
    let courseCount = 0;
    let mappingCount = 0;

    for (const exchange of allExchanges) {
      const universityId = universityIdMap[exchange.university];

      if (!universityId) {
        console.log(`⚠️  Skipping exchange for unknown university: ${exchange.university}`);
        continue;
      }

      // Insert exchange agreement
      const agreementResult = await client.query(
        `INSERT INTO exchange_agreements
         (university_id, study_program, specialization, study_year, num_semesters, year)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          universityId,
          exchange.study,
          exchange.specialization,
          exchange.studyYear,
          exchange.numSemesters,
          exchange.year
        ]
      );
      const agreementId = agreementResult.rows[0].id;
      exchangeCount++;

      // Insert courses for this exchange
      if (exchange.courses) {
        for (const [semester, courses] of Object.entries(exchange.courses) as any) {
          if (!Array.isArray(courses)) continue;

          for (const course of courses) {
            // Skip null or invalid courses
            if (!course || !course.courseCode || !course.courseName) {
              continue;
            }

            // Insert or get course
            const courseResult = await client.query(
              `INSERT INTO courses
               (university_id, course_code, course_name, ects_points, institute, semester)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (university_id, course_code)
               DO UPDATE SET course_name = EXCLUDED.course_name
               RETURNING id`,
              [
                universityId,
                course.courseCode,
                course.courseName,
                course.ECTSPoints ? parseFloat(course.ECTSPoints) : null,
                course.institute || null,
                semester
              ]
            );
            const courseId = courseResult.rows[0].id;
            courseCount++;

            // Insert course mapping
            await client.query(
              `INSERT INTO course_mappings
               (exchange_agreement_id, course_id, replaced_course_code, replaced_course_name,
                course_type, semester, comments)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                agreementId,
                courseId,
                course.replacedCourseCode || null,
                course.replacedCourseName || null,
                course.courseType || null,
                semester,
                course.comments || null
              ]
            );
            mappingCount++;
          }
        }
      }
    }

    console.log(`✅ Inserted ${exchangeCount} exchange agreements`);
    console.log(`✅ Inserted ${courseCount} courses`);
    console.log(`✅ Inserted ${mappingCount} course mappings\n`);

    // Initialize university stats
    console.log('📊 Initializing university statistics...');
    await client.query(`
      INSERT INTO university_stats (university_id, total_reviews)
      SELECT id, 0 FROM universities
      ON CONFLICT (university_id) DO NOTHING
    `);
    console.log('✅ University statistics initialized\n');

    console.log('🎉 Migration completed successfully!');

    // Print summary
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM universities) as universities,
        (SELECT COUNT(*) FROM exchange_agreements) as exchanges,
        (SELECT COUNT(*) FROM courses) as courses,
        (SELECT COUNT(*) FROM course_mappings) as mappings
    `);

    console.log('\n📈 Database Summary:');
    console.log(`   Universities: ${stats.rows[0].universities}`);
    console.log(`   Exchanges: ${stats.rows[0].exchanges}`);
    console.log(`   Courses: ${stats.rows[0].courses}`);
    console.log(`   Course Mappings: ${stats.rows[0].mappings}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
