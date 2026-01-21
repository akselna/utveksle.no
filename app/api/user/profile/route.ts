import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { updateUserProfile, getUserById } from '@/lib/users';

// GET /api/user/profile - Get current user's profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserById(parseInt(session.user.id));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Update current user's profile
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, study_program, specialization, study_year, university } = body;

    // Validate at least one field is being updated
    if (!name && !study_program && !specialization && !study_year && !university) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (study_program !== undefined) updates.study_program = study_program;
    if (specialization !== undefined) updates.specialization = specialization;
    if (study_year !== undefined) updates.study_year = study_year;
    if (university !== undefined) updates.university = university;

    const updatedUser = await updateUserProfile(parseInt(session.user.id), updates);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
