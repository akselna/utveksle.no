import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing courseId' },
        { status: 400 }
      );
    }

    // Update course to set approved = true
    const result = await query(
      `UPDATE approved_courses
       SET approved = true, approval_date = CURRENT_DATE
       WHERE id = $1
       RETURNING *`,
      [courseId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error approving course:', error);
    return NextResponse.json(
      { error: 'Failed to approve course' },
      { status: 500 }
    );
  }
}
