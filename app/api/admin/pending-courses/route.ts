import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch all pending courses (approved = false) with user information
    const sql = `
      SELECT
        ac.id,
        ac.ntnu_course_code,
        ac.ntnu_course_name,
        ac.exchange_university,
        ac.exchange_country,
        ac.exchange_course_code,
        ac.exchange_course_name,
        ac.ects,
        ac.semester,
        ac.created_at,
        u.name as user_name,
        u.email as user_email
      FROM approved_courses ac
      LEFT JOIN users u ON ac.user_id = u.id
      WHERE ac.approved = false
      ORDER BY ac.created_at DESC
    `;

    const result = await query(sql);

    return NextResponse.json({
      courses: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching pending courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending courses' },
      { status: 500 }
    );
  }
}
