import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    // Verify admin role
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mappingId = searchParams.get('id');

    if (!mappingId) {
      return NextResponse.json({ error: 'Mapping ID required' }, { status: 400 });
    }

    const result = await query('DELETE FROM approved_courses WHERE id = $1 RETURNING id', [mappingId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting mapping:', error);
    return NextResponse.json({ error: 'Failed to delete mapping' }, { status: 500 });
  }
}
