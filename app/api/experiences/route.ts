import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

// GET /api/experiences - Get all experiences (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('id');
    const university = searchParams.get('university');

    if (experienceId) {
      // Get specific experience
      const result = await query(
        `SELECT e.*, u.name as user_name
         FROM experiences e
         LEFT JOIN users u ON e.user_id = u.id
         WHERE e.id = $1`,
        [experienceId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Experience not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        experience: result.rows[0]
      });
    } else {
      // Get all experiences, optionally filtered by university
      let sql = `SELECT e.*, u.name as user_name
                 FROM experiences e
                 LEFT JOIN users u ON e.user_id = u.id`;
      const params: any[] = [];

      if (university) {
        sql += ` WHERE e.university_name = $1`;
        params.push(university);
      }

      sql += ` ORDER BY e.created_at DESC`;

      const result = await query(sql, params);

      return NextResponse.json({
        success: true,
        experiences: result.rows
      });
    }
  } catch (error: any) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

// POST /api/experiences - Create new experience (requires authentication)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to add an experience' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      university_id,
      university_name,
      country,
      study_program,
      specialization,
      study_year,
      semester,
      year,
      student_name,
      review,
      rating,
      pros,
      cons,
      beer_price,
      meal_price,
      rent_price,
      images
    } = body;

    // Validate required fields
    if (!university_name || !country || !study_program || !study_year ||
        !semester || !year || !student_name || !review || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Filter out empty strings from pros and cons
    const filteredPros = pros?.filter((p: string) => p.trim() !== '') || [];
    const filteredCons = cons?.filter((c: string) => c.trim() !== '') || [];

    // Insert experience
    const result = await query(
      `INSERT INTO experiences
       (user_id, university_id, university_name, country, study_program,
        specialization, study_year, semester, year, student_name, review,
        rating, pros, cons, beer_price, meal_price, rent_price, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        parseInt(session.user.id),
        university_id || null,
        university_name,
        country,
        study_program,
        specialization || null,
        study_year,
        semester,
        year,
        student_name,
        review,
        rating,
        filteredPros.length > 0 ? JSON.stringify(filteredPros) : null,
        filteredCons.length > 0 ? JSON.stringify(filteredCons) : null,
        beer_price || null,
        meal_price || null,
        rent_price || null,
        images ? JSON.stringify(images) : null
      ]
    );

    return NextResponse.json({
      success: true,
      experience: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error creating experience:', error);
    return NextResponse.json(
      { error: 'Failed to create experience' },
      { status: 500 }
    );
  }
}

// PATCH /api/experiences?id=X - Update experience (must be owner)
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to update an experience' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('id');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const ownerCheck = await query(
      `SELECT user_id FROM experiences WHERE id = $1`,
      [experienceId]
    );

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    if (ownerCheck.rows[0].user_id !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'You can only update your own experiences' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      review,
      rating,
      pros,
      cons,
      beer_price,
      meal_price,
      rent_price
    } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (review !== undefined) {
      updates.push(`review = $${paramIndex++}`);
      values.push(review);
    }
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
      updates.push(`rating = $${paramIndex++}`);
      values.push(rating);
    }
    if (pros !== undefined) {
      const filteredPros = pros.filter((p: string) => p.trim() !== '');
      updates.push(`pros = $${paramIndex++}`);
      values.push(filteredPros.length > 0 ? JSON.stringify(filteredPros) : null);
    }
    if (cons !== undefined) {
      const filteredCons = cons.filter((c: string) => c.trim() !== '');
      updates.push(`cons = $${paramIndex++}`);
      values.push(filteredCons.length > 0 ? JSON.stringify(filteredCons) : null);
    }
    if (beer_price !== undefined) {
      updates.push(`beer_price = $${paramIndex++}`);
      values.push(beer_price || null);
    }
    if (meal_price !== undefined) {
      updates.push(`meal_price = $${paramIndex++}`);
      values.push(meal_price || null);
    }
    if (rent_price !== undefined) {
      updates.push(`rent_price = $${paramIndex++}`);
      values.push(rent_price || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(experienceId);

    const result = await query(
      `UPDATE experiences
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return NextResponse.json({
      success: true,
      experience: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: 'Failed to update experience' },
      { status: 500 }
    );
  }
}

// DELETE /api/experiences?id=X - Delete experience (must be owner)
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to delete an experience' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('id');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership and delete
    const result = await query(
      `DELETE FROM experiences
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [experienceId, parseInt(session.user.id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Experience not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    );
  }
}
