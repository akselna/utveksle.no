import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const continent = searchParams.get('continent');

    let sql = `
      SELECT
        u.*,
        COALESCE(s.avg_overall_rating, 0) as avg_rating,
        COALESCE(s.avg_difficulty_rating, 0) as avg_difficulty,
        COALESCE(s.avg_price_rating, 0) as avg_price,
        COALESCE(s.avg_social_rating, 0) as avg_social,
        COALESCE(s.total_reviews, 0) as review_count
      FROM universities u
      LEFT JOIN university_stats s ON u.id = s.university_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (country) {
      sql += ` AND u.country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }

    if (continent) {
      sql += ` AND u.continent = $${paramIndex}`;
      params.push(continent);
      paramIndex++;
    }

    sql += ` ORDER BY u.name`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      universities: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching universities:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
