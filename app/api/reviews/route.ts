import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

// GET /api/reviews - Get reviews for a university
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('university_id');

    if (!universityId) {
      return NextResponse.json(
        { error: 'university_id is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT
        r.*,
        u.name as user_name,
        u.study_program,
        u.study_year
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.university_id = $1
      ORDER BY r.created_at DESC`,
      [universityId]
    );

    return NextResponse.json({
      success: true,
      reviews: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review (requires authentication)
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to submit a review' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      university_id,
      difficulty_rating,
      price_rating,
      social_rating,
      overall_rating,
      comment,
      semester,
      year
    } = body;

    // Validate required fields
    if (!university_id || !overall_rating) {
      return NextResponse.json(
        { error: 'university_id and overall_rating are required' },
        { status: 400 }
      );
    }

    // Validate ratings are between 1 and 5
    const ratings = [difficulty_rating, price_rating, social_rating, overall_rating].filter(Boolean);
    if (ratings.some(r => r < 1 || r > 5)) {
      return NextResponse.json(
        { error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this university
    const existingReview = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND university_id = $2',
      [parseInt(session.user.id), university_id]
    );

    if (existingReview.rows.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this university' },
        { status: 409 }
      );
    }

    // Insert review
    const result = await query(
      `INSERT INTO reviews
       (user_id, university_id, difficulty_rating, price_rating, social_rating,
        overall_rating, comment, semester, year, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        parseInt(session.user.id),
        university_id,
        difficulty_rating || null,
        price_rating || null,
        social_rating || null,
        overall_rating,
        comment || null,
        semester || null,
        year || null,
        false // Start as unverified
      ]
    );

    // Update university stats
    await updateUniversityStats(university_id);

    return NextResponse.json({
      success: true,
      review: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// Helper function to update university statistics
async function updateUniversityStats(universityId: number) {
  await query(
    `INSERT INTO university_stats (university_id, avg_difficulty_rating, avg_price_rating,
      avg_social_rating, avg_overall_rating, total_reviews)
    SELECT
      $1,
      AVG(difficulty_rating)::DECIMAL(3,2),
      AVG(price_rating)::DECIMAL(3,2),
      AVG(social_rating)::DECIMAL(3,2),
      AVG(overall_rating)::DECIMAL(3,2),
      COUNT(*)::INTEGER
    FROM reviews
    WHERE university_id = $1
    ON CONFLICT (university_id)
    DO UPDATE SET
      avg_difficulty_rating = EXCLUDED.avg_difficulty_rating,
      avg_price_rating = EXCLUDED.avg_price_rating,
      avg_social_rating = EXCLUDED.avg_social_rating,
      avg_overall_rating = EXCLUDED.avg_overall_rating,
      total_reviews = EXCLUDED.total_reviews,
      last_updated = CURRENT_TIMESTAMP`,
    [universityId]
  );
}
