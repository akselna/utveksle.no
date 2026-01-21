import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

// GET /api/contact-requests - Hent mine varsler (innkommende forespørsler OG svar på mine forespørsler)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // 1. Hent mottatte forespørsler (der jeg er receiver) som er pending
    const incomingResult = await query(
      `SELECT 
        cr.id, 
        cr.created_at,
        'incoming' as type,
        u.name as other_user_name, 
        u.study_program as other_user_study
       FROM contact_requests cr
       JOIN users u ON cr.sender_id = u.id
       WHERE cr.receiver_id = $1 AND cr.status = 'pending'`,
      [userId]
    );

    // 2. Hent svar på mine forespørsler (der jeg er sender) som er accepted men ikke sett
    const acceptedResult = await query(
      `SELECT 
        cr.id, 
        cr.updated_at as created_at, -- Use updated_at as the "notification time"
        'accepted' as type,
        u.name as other_user_name, 
        u.study_program as other_user_study
       FROM contact_requests cr
       JOIN users u ON cr.receiver_id = u.id
       WHERE cr.sender_id = $1 AND cr.status = 'accepted' AND cr.sender_seen = FALSE`,
      [userId]
    );

    // Combine and sort by date (newest first)
    const notifications = [...incomingResult.rows, ...acceptedResult.rows].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error: any) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/contact-requests - Send en forespørsel
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiver_id } = body;
    const senderId = parseInt(session.user.id);
    const receiverId = parseInt(receiver_id);

    if (!receiverId || senderId === receiverId) {
      return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
    }

    await query(
      `INSERT INTO contact_requests (sender_id, receiver_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (sender_id, receiver_id) DO NOTHING`,
      [senderId, receiverId]
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error sending request:', error);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}

// PATCH /api/contact-requests - Svar på en forespørsel ELLER marker som lest
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { request_id, action } = body; // action: 'accept', 'reject', 'mark_seen'
    const userId = parseInt(session.user.id);

    if (!request_id || !['accept', 'reject', 'mark_seen'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let result;

    if (action === 'mark_seen') {
      // Mark as seen (only for sender)
      result = await query(
        `UPDATE contact_requests
         SET sender_seen = TRUE
         WHERE id = $1 AND sender_id = $2
         RETURNING *`,
        [request_id, userId]
      );
    } else {
      // Accept/Reject (only for receiver)
      const status = action === 'accept' ? 'accepted' : 'rejected';
      result = await query(
        `UPDATE contact_requests
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND receiver_id = $3
         RETURNING *`,
        [status, request_id, userId]
      );
    }

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Request not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
