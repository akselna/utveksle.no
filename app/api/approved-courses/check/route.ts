import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ntnuCode = searchParams.get('ntnu_code')?.toUpperCase();
    const exchangeCode = searchParams.get('exchange_code')?.toUpperCase();
    const university = searchParams.get('university');

    if (!ntnuCode || !exchangeCode || !university) {
      return NextResponse.json(
        { error: 'Missing required parameters: ntnu_code, exchange_code, university' },
        { status: 400 }
      );
    }

    // Check if this exact match exists in approved_courses
    const sql = `
      SELECT id
      FROM approved_courses
      WHERE ntnu_course_code = $1
        AND exchange_course_code = $2
        AND exchange_university = $3
      LIMIT 1
    `;

    const result = await query(sql, [ntnuCode, exchangeCode, university]);

    return NextResponse.json({
      exists: result.rows.length > 0
    });

  } catch (error: any) {
    console.error('Error checking course match:', error);
    return NextResponse.json(
      { error: 'Failed to check course match' },
      { status: 500 }
    );
  }
}
