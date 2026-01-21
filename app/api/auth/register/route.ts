import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, study_program, specialization, study_year } =
      body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "E-post, passord og navn kreves" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Ugyldig e-post" }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Passordet må inneholde minst 6 tegn" },
        { status: 400 }
      );
    }

    // Create user in database
    const user = await createUser({
      email,
      password,
      name,
      study_program: study_program || null,
      specialization: specialization || null,
      study_year: study_year || null,
      university: "NTNU",
      provider: "credentials",
    });

    return NextResponse.json({
      success: true,
      message: "Brukeren ble registrert",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        study_program: user.study_program,
        specialization: user.specialization,
        study_year: user.study_year,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.message.includes("already exists")) {
      return NextResponse.json(
        { error: "En bruker med denne e-postadressen eksisterer allerede" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Mislyktes å registrere brukeren" },
      { status: 500 }
    );
  }
}
