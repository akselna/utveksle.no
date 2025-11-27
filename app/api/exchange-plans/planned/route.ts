import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure this isn't cached at build time

// GET /api/exchange-plans/planned - Get all planned exchanges (public/anonymous)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearStartParam = searchParams.get('academic_year_start');

    let sqlQuery = `
      SELECT
        ep.id,
        ep.university_name,
        ep.country,
        ep.semester,
        ep.exchange_year,
        u.study_program
      FROM exchange_plans ep
      LEFT JOIN users u ON ep.user_id = u.id
      WHERE ep.status != 'cancelled'
    `;
    
    const values: any[] = [];

    // Filter by Academic Year (Autumn of start year + Spring of start year + 1)
    if (academicYearStartParam) {
      const startYear = parseInt(academicYearStartParam);
      // Logic: (Year = StartYear AND Semester contains 'Høst') OR (Year = StartYear + 1 AND Semester contains 'Vår')
      // Note: DB semester might be 'Høst' or 'Høst 2025'. We check for 'Høst' or 'Vår' text.
      sqlQuery += ` AND (
        (ep.exchange_year = $1 AND ep.semester LIKE '%Høst%') 
        OR 
        (ep.exchange_year = $1 + 1 AND ep.semester LIKE '%Vår%')
      )`;
      values.push(startYear);
    }

    // Order by most recently created
    sqlQuery += ` ORDER BY ep.created_at DESC`;

    const result = await query(sqlQuery, values);

    // Transform to match the PlannedExchange interface in frontend
    const plannedExchanges = result.rows.map(row => ({
      id: `db-plan-${row.id}`,
      university: row.university_name,
      country: row.country || 'Unknown',
      study: row.study_program || 'Ukjent studie',
      studentName: 'Anonym student', // Anonymized as requested
      semester: row.semester || 'Ukjent semester',
      year: row.exchange_year
    }));

    return NextResponse.json({
      success: true,
      plannedExchanges
    });

  } catch (error: any) {
    console.error('Error fetching planned exchanges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch planned exchanges' },
      { status: 500 }
    );
  }
}