import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic'; // Ensure this isn't cached at build time

// GET /api/exchange-plans/planned - Get all planned exchanges (public/anonymous)
export async function GET(request: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;

    const { searchParams } = new URL(request.url);
    const targetYear = searchParams.get('year');
    const targetSemester = searchParams.get('semester');

    // Base query: Get plans and user details
    // We also LEFT JOIN contact_requests to check relationship with current user
    // Status logic:
    // - 'self': If plan.user_id == currentUserId
    // - 'accepted': If there is an accepted request between the two (either direction)
    // - 'pending_sent': If I sent a request and it's pending
    // - 'pending_received': If I received a request and it's pending (not strictly needed for map, but good context)
    // - 'none': No relationship
    
    let sqlQuery = `
      SELECT
        ep.id,
        ep.university_name,
        ep.country,
        ep.semester,
        ep.exchange_year,
        ep.user_id,
        u.study_program,
        u.name as real_name,
        CASE 
            WHEN ep.user_id = $1 THEN 'self'
            WHEN cr_sent.status = 'accepted' OR cr_recv.status = 'accepted' THEN 'accepted'
            WHEN cr_sent.status = 'pending' THEN 'pending_sent'
            ELSE 'none'
        END as contact_status
      FROM exchange_plans ep
      LEFT JOIN users u ON ep.user_id = u.id
      -- Check if I sent a request
      LEFT JOIN contact_requests cr_sent ON cr_sent.sender_id = $1 AND cr_sent.receiver_id = ep.user_id
      -- Check if I received a request (and accepted it, making names visible)
      LEFT JOIN contact_requests cr_recv ON cr_recv.receiver_id = $1 AND cr_recv.sender_id = ep.user_id
      WHERE ep.status != 'cancelled'
    `;
    
    const values: any[] = [currentUserId]; // $1 is currentUserId
    let paramIndex = 2;

    // Filter by specific Semester and Year
    if (targetYear && targetSemester) {
      sqlQuery += ` AND ep.exchange_year = $${paramIndex++} AND ep.semester ILIKE $${paramIndex++}`;
      values.push(parseInt(targetYear), `%${targetSemester}%`);
    } else {
      sqlQuery += ` AND ep.exchange_year >= EXTRACT(YEAR FROM CURRENT_DATE)`;
    }

    // Order by most recently created
    sqlQuery += ` ORDER BY ep.created_at DESC`;

    const result = await query(sqlQuery, values);

    // Transform to match the PlannedExchange interface in frontend
    const plannedExchanges = result.rows.map(row => {
      // Determine display name based on privacy rules
      let studentName = 'Anonym student';
      if (row.contact_status === 'self') {
        studentName = 'Meg';
      } else if (row.contact_status === 'accepted') {
        studentName = row.real_name;
      }

      return {
        id: `db-plan-${row.id}`,
        userId: row.user_id, // Exposed for request logic
        university: row.university_name,
        country: row.country || 'Unknown',
        study: row.study_program || 'Ukjent studie',
        studentName: studentName, 
        semester: row.semester || 'Ukjent semester',
        year: row.exchange_year,
        contactStatus: row.contact_status
      };
    });

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