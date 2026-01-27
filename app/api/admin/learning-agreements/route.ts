import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

// GET - Fetch all learning agreements
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await pool.query(
      'SELECT role FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Fetch all learning agreements with user information
    const result = await pool.query(`
      SELECT
        la.id,
        la.pdf_url,
        la.cloudinary_public_id,
        la.uploaded_at,
        la.behandlet,
        la.behandlet_dato,
        u.name as user_name,
        u.email as user_email,
        admin_user.name as behandlet_av_name
      FROM learning_agreements la
      JOIN users u ON la.user_id = u.id
      LEFT JOIN users admin_user ON la.behandlet_av = admin_user.id
      ORDER BY la.behandlet ASC, la.uploaded_at DESC
    `);

    return NextResponse.json({
      success: true,
      agreements: result.rows
    });
  } catch (error) {
    console.error('Error fetching learning agreements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning agreements' },
      { status: 500 }
    );
  }
}

// PUT - Mark learning agreement as behandlet
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const adminUserId = userResult.rows[0].id;
    const body = await request.json();
    const { id, behandlet } = body;

    if (!id || typeof behandlet !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update learning agreement
    await pool.query(
      `UPDATE learning_agreements
       SET behandlet = $1,
           behandlet_av = $2,
           behandlet_dato = $3
       WHERE id = $4`,
      [behandlet, behandlet ? adminUserId : null, behandlet ? new Date() : null, id]
    );

    return NextResponse.json({
      success: true,
      message: behandlet ? 'Markert som behandlet' : 'Markering fjernet'
    });
  } catch (error) {
    console.error('Error updating learning agreement:', error);
    return NextResponse.json(
      { error: 'Failed to update learning agreement' },
      { status: 500 }
    );
  }
}
