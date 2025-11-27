import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test 1: Check connection and get current time
    const timeResult = await query('SELECT NOW() as current_time');

    // Test 2: Get database version
    const versionResult = await query('SELECT version()');

    // Test 3: List all tables
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        currentTime: timeResult.rows[0].current_time,
        version: versionResult.rows[0].version,
        tables: tablesResult.rows.map(row => row.table_name),
        tableCount: tablesResult.rows.length
      }
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error.message
      },
      { status: 500 }
    );
  }
}
