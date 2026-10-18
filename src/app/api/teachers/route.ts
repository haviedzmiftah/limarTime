import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachers, classrooms } from "@/db/schema";
import { asc } from "drizzle-orm";

/**
 * GET /api/teachers
 * Mengambil daftar 55 tenaga pendidik
 */
export async function GET() {
  try {
    const list = await db
      .select({
        id: teachers.id,
        code: teachers.code,
        name: teachers.name,
        nip: teachers.nip,
        mainSubject: teachers.mainSubject,
      })
      .from(teachers)
      .orderBy(asc(teachers.no));

    return NextResponse.json({
      success: true,
      total: list.length,
      teachers: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
