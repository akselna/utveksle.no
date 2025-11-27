import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

// GET /api/exchange-plans - Get all plans for current user
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to view plans' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('id');

    if (planId) {
      // Get specific plan with courses
      const planResult = await query(
        `SELECT ep.*, u.name as university_display_name
         FROM exchange_plans ep
         LEFT JOIN universities u ON ep.university_id = u.id
         WHERE ep.id = $1 AND ep.user_id = $2`,
        [planId, parseInt(session.user.id)]
      );

      if (planResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        );
      }

      // Get courses for this plan
      const coursesResult = await query(
        `SELECT * FROM saved_courses WHERE exchange_plan_id = $1 ORDER BY semester, course_code`,
        [planId]
      );

      return NextResponse.json({
        success: true,
        plan: {
          ...planResult.rows[0],
          courses: coursesResult.rows
        }
      });
    } else {
      // Get all plans for user
      const result = await query(
        `SELECT ep.*, u.name as university_display_name
         FROM exchange_plans ep
         LEFT JOIN universities u ON ep.university_id = u.id
         WHERE ep.user_id = $1
         ORDER BY ep.created_at DESC`,
        [parseInt(session.user.id)]
      );

      // Get courses for each plan
      const plansWithCourses = await Promise.all(
        result.rows.map(async (plan) => {
          const coursesResult = await query(
            `SELECT * FROM saved_courses WHERE exchange_plan_id = $1 ORDER BY semester, course_code`,
            [plan.id]
          );
          return {
            ...plan,
            courses: coursesResult.rows
          };
        })
      );

      return NextResponse.json({
        success: true,
        plans: plansWithCourses
      });
    }
  } catch (error: any) {
    console.error('Error fetching exchange plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST /api/exchange-plans - Create new plan
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to create a plan' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      university_id,
      plan_name,
      university_name,
      country,
      semester,
      duration,
      selected_courses,
      notes,
      status = 'draft'
    } = body;

    // Validate required fields
    if (!university_name) {
      return NextResponse.json(
        { error: 'university_name is required' },
        { status: 400 }
      );
    }

    // Generate default plan name if not provided
    const finalPlanName = plan_name || `${university_name} - ${semester || 'Utveksling'}`;

    // Insert exchange plan
    const planResult = await query(
      `INSERT INTO exchange_plans
       (user_id, university_id, plan_name, university_name, country, semester, duration, selected_courses, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        parseInt(session.user.id),
        university_id || null,
        finalPlanName,
        university_name,
        country || null,
        semester || null,
        duration || null,
        selected_courses ? JSON.stringify(selected_courses) : null,
        notes || null,
        status
      ]
    );

    const plan = planResult.rows[0];

    // If courses provided, insert them
    if (selected_courses && Array.isArray(selected_courses)) {
      for (const course of selected_courses) {
        await query(
          `INSERT INTO saved_courses
           (exchange_plan_id, course_code, course_name, ects_points, semester,
            replaces_course_code, replaces_course_name, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            plan.id,
            course.course_code,
            course.course_name,
            course.ects_points || null,
            course.semester || null,
            course.replaces_course_code || null,
            course.replaces_course_name || null,
            course.notes || null
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      plan
    });
  } catch (error: any) {
    console.error('Error creating exchange plan:', error);

    if (error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'You already have a plan for this university and semester' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

// PATCH /api/exchange-plans?id=X - Update plan
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to update a plan' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('id');

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { plan_name, semester, duration, selected_courses, notes, status, is_favorite } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (plan_name !== undefined) {
      updates.push(`plan_name = $${paramIndex++}`);
      values.push(plan_name);
    }
    if (semester !== undefined) {
      updates.push(`semester = $${paramIndex++}`);
      values.push(semester);
    }
    if (duration !== undefined) {
      updates.push(`duration = $${paramIndex++}`);
      values.push(duration);
    }
    if (selected_courses !== undefined) {
      updates.push(`selected_courses = $${paramIndex++}`);
      values.push(JSON.stringify(selected_courses));
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (is_favorite !== undefined) {
      updates.push(`is_favorite = $${paramIndex++}`);
      values.push(is_favorite);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(planId, parseInt(session.user.id));

    const result = await query(
      `UPDATE exchange_plans
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating exchange plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/exchange-plans?id=X - Delete plan
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to delete a plan' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('id');

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `DELETE FROM exchange_plans
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [planId, parseInt(session.user.id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting exchange plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
