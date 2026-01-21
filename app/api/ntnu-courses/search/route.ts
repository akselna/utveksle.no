import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ courses: [] });
  }

  try {
    const searchQuery = `%${q}%`;
    const result = await query(
      `SELECT * FROM ntnu_courses 
       WHERE code ILIKE $1 OR name ILIKE $1 
       ORDER BY 
         CASE 
           WHEN code ILIKE $2 THEN 1 
           WHEN code ILIKE $1 THEN 2 
           ELSE 3 
         END,
         code ASC 
       LIMIT 10`,
      [searchQuery, `${q}%`] // Prioritize matches starting with the query
    );

    return NextResponse.json({ courses: result.rows });
  } catch (error) {
    console.error("Error searching NTNU courses:", error);
    return NextResponse.json(
      { error: "Failed to search courses" },
      { status: 500 }
    );
  }
}
