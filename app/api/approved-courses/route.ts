import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import { updateLastActive } from '@/lib/users';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const university = searchParams.get('university') || 'all';
    const country = searchParams.get('country') || 'all';
    const ects = searchParams.get('ects') || 'all';
    const verified = searchParams.get('verified') === 'true';
    const userId = searchParams.get('user_id');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Non-admins can see approved courses OR their own courses (even if pending)
    if (!isAdmin) {
      if (session?.user?.id) {
        conditions.push(`(approved = true OR user_id = $${paramCount})`);
        params.push(parseInt(session.user.id));
        paramCount++;
      } else {
        conditions.push('approved = true');
      }
    }

    if (userId) {
      conditions.push(`user_id = $${paramCount}`);
      params.push(parseInt(userId));
      paramCount++;
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(`(
        ntnu_course_code ILIKE $${paramCount} OR
        ntnu_course_name ILIKE $${paramCount} OR
        exchange_course_code ILIKE $${paramCount} OR
        exchange_course_name ILIKE $${paramCount} OR
        exchange_university ILIKE $${paramCount} OR
        exchange_country ILIKE $${paramCount}
      )`);
      params.push(searchPattern);
      paramCount++;
    }

    if (university !== 'all') {
      conditions.push(`exchange_university = $${paramCount}`);
      params.push(university);
      paramCount++;
    }

    if (country !== 'all') {
      conditions.push(`exchange_country = $${paramCount}`);
      params.push(country);
      paramCount++;
    }

    if (ects !== 'all') {
      conditions.push(`ects = $${paramCount}`);
      params.push(parseFloat(ects));
      paramCount++;
    }

    if (verified) {
      conditions.push(`verified = true`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countSql = `
      SELECT COUNT(*) as total
      FROM approved_courses
      ${whereClause}
    `;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const sql = `
      SELECT
        id,
        user_id,
        ntnu_course_code as "NTNU_Emnekode",
        ntnu_course_name as "NTNU_Fagnavn",
        exchange_university as "University",
        exchange_country as "Country",
        exchange_course_code as "Bologna_Emnekode",
        exchange_course_name as "Bologna_Fagnavn",
        ects as "ECTS",
        semester as "Semester",
        verified,
        wiki_url as "Wiki_URL",
        CASE
          WHEN wiki_url IS NOT NULL THEN approval_date
          ELSE COALESCE(approval_date, created_at::date)
        END as "Behandlingsdato"
      FROM approved_courses
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(sql, [...params, limit, offset]);

    // Transform to match the JSON structure the frontend expects
    const courses = result.rows.map(row => ({
      ...row,
      ECTS: row.ECTS ? parseFloat(row.ECTS).toString() : null,
      Behandlingsdato: row.Behandlingsdato ? row.Behandlingsdato.toISOString().split('T')[0] : null,
    }));

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Error fetching approved courses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const {
      ntnu_course_code,
      ntnu_course_name,
      exchange_university,
      exchange_country,
      exchange_course_code,
      exchange_course_name,
      ects,
      semester
    } = body;

    // Validate required fields
    if (!ntnu_course_code || !ntnu_course_name || !exchange_university || !exchange_country || !exchange_course_code || !ects) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is admin - admins can auto-verify and auto-approve courses
    const isAdmin = session?.user?.role === 'admin';

    // Check if NTNU course exists, if not create it
    const courseCodeUpper = ntnu_course_code.replace(/\s+/g, '').toUpperCase();
    const ntnuCourseCheck = await query(
      'SELECT code FROM ntnu_courses WHERE code = $1',
      [courseCodeUpper]
    );

    if (ntnuCourseCheck.rows.length === 0) {
      // NTNU course doesn't exist, create it
      await query(
        `INSERT INTO ntnu_courses (code, name, credits)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO NOTHING`,
        [courseCodeUpper, ntnu_course_name, parseFloat(ects)]
      );
    }

    // Insert into database
    const result = await query(
      `INSERT INTO approved_courses (
        ntnu_course_code,
        ntnu_course_name,
        exchange_university,
        exchange_country,
        exchange_course_code,
        exchange_course_name,
        ects,
        semester,
        verified,
        approved,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        courseCodeUpper,
        ntnu_course_name,
        exchange_university,
        exchange_country,
        exchange_course_code.replace(/\s+/g, '').toUpperCase(),
        exchange_course_name,
        parseFloat(ects),
        semester,
        isAdmin, // Set verified to true if admin, false otherwise
        isAdmin, // Set approved to true if admin, false otherwise (requires manual approval)
        session?.user?.id ? parseInt(session.user.id) : null
      ]
    );

    if (session?.user?.id) {
      await updateLastActive(parseInt(session.user.id));
    }

    return NextResponse.json({
      success: true,
      course: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error creating approved course:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
       return NextResponse.json(
        { error: 'This course mapping already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create course mapping' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    // Check if user is admin
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      ntnu_course_code,
      ntnu_course_name,
      exchange_course_code,
      exchange_course_name,
      ects,
      semester
    } = body;

    if (!id) {
       return NextResponse.json(
        { error: 'Missing course ID' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const courseCodeUpper = ntnu_course_code.replace(/\s+/g, '').toUpperCase();
    const courseName = ntnu_course_name.trim();
    const exchangeCodeUpper = exchange_course_code.replace(/\s+/g, '').toUpperCase();
    const exchangeName = exchange_course_name.trim();
    
    // Handle ECTS with comma or dot
    const ectsString = String(ects).replace(',', '.');
    const ectsValue = parseFloat(ectsString);

    if (isNaN(ectsValue)) {
      return NextResponse.json(
        { error: 'Invalid ECTS value' },
        { status: 400 }
      );
    }

    // Ensure NTNU course exists
    await query(
      `INSERT INTO ntnu_courses (code, name, credits)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO NOTHING`,
      [courseCodeUpper, courseName, ectsValue]
    );

    // Update approved_courses
    // distinct from approval_date or created_at which we do NOT touch
    const result = await query(
      `UPDATE approved_courses
       SET
        ntnu_course_code = $1,
        ntnu_course_name = $2,
        exchange_course_code = $3,
        exchange_course_name = $4,
        ects = $5,
        semester = $6
       WHERE id = $7
       RETURNING *`,
      [
        courseCodeUpper,
        courseName,
        exchangeCodeUpper,
        exchangeName,
        ectsValue,
        semester,
        id
      ]
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
    console.error('Error updating course:', error);
    // Handle unique constraint violation
    if (error.code === '23505') {
       return NextResponse.json(
        { error: 'A course with these details already exists for this university.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to update course: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    // Check if user is admin
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing course ID' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM approved_courses WHERE id = $1 RETURNING id',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
