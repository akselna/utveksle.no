import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 1) {
      return NextResponse.json({ courses: [] });
    }

    const client = await pool.connect();

    try {
      // Søk i både kurskode og kursnavn
      const result = await client.query(
        `SELECT code, name, credits
         FROM ntnu_courses
         WHERE
           UPPER(code) LIKE UPPER($1) OR
           UPPER(name) LIKE UPPER($2)
         ORDER BY
           CASE
             WHEN UPPER(code) = UPPER($3) THEN 1
             WHEN UPPER(code) LIKE UPPER($4) THEN 2
             WHEN UPPER(name) LIKE UPPER($5) THEN 3
             ELSE 4
           END,
           code
         LIMIT $6`,
        [
          `${query}%`,        // Kurskode starter med søk
          `%${query}%`,       // Kursnavn inneholder søk
          query,              // Eksakt match på kurskode (høyest prioritet)
          `${query}%`,        // Kurskode starter med (prioritet 2)
          `${query}%`,        // Kursnavn starter med (prioritet 3)
          limit
        ]
      );

      return NextResponse.json({
        courses: result.rows,
        count: result.rows.length
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error searching NTNU courses:', error);
    return NextResponse.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    );
  }
}
