import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Fetch unique values for filters in parallel
    const [universitiesRes, countriesRes, ectsRes, pairsRes] = await Promise.all([
      query('SELECT DISTINCT exchange_university FROM approved_courses ORDER BY exchange_university'),
      query('SELECT DISTINCT exchange_country FROM approved_courses ORDER BY exchange_country'),
      query('SELECT DISTINCT ects FROM approved_courses WHERE ects IS NOT NULL ORDER BY ects'),
      query('SELECT DISTINCT exchange_university, exchange_country FROM approved_courses WHERE exchange_university IS NOT NULL AND exchange_country IS NOT NULL ORDER BY exchange_country, exchange_university')
    ]);

    const universities = universitiesRes.rows.map(r => r.exchange_university).filter(Boolean);
    const countries = countriesRes.rows.map(r => r.exchange_country).filter(Boolean);
    const ects = ectsRes.rows.map(r => r.ects).filter(Boolean).sort((a, b) => a - b);
    
    const university_country_pairs = pairsRes.rows.map(r => ({
      university: r.exchange_university,
      country: r.exchange_country
    }));

    return NextResponse.json({
      universities,
      countries,
      ects,
      university_country_pairs
    });
  } catch (error: any) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}
