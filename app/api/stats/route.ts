import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get counts from database
    const [coursesResult, experiencesResult, usersResult] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM approved_courses`),
      query(`SELECT COUNT(*) as count FROM experiences`),
      query(`SELECT COUNT(*) as count FROM users`)
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        courses: parseInt(coursesResult.rows[0].count),
        experiences: parseInt(experiencesResult.rows[0].count),
        users: parseInt(usersResult.rows[0].count)
      }
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

