import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachers, classrooms, subjects, timetableSlots } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

/**
 * GET /api/admin/master-data
 * Mengambil seluruh data referensi (Teachers, Classrooms, Subjects) serta ringkasan statistik
 */
export async function GET() {
  try {
    const teachersList = await db.select().from(teachers).orderBy(teachers.no);
    const classroomsList = await db.select().from(classrooms).orderBy(classrooms.orderIndex);
    const subjectsList = await db.select().from(subjects).orderBy(subjects.name);

    const [totalSlots] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timetableSlots);

    const [lockedSlots] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timetableSlots)
      .where(eq(timetableSlots.isLocked, true));

    const [filledSlots] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timetableSlots)
      .where(sql`${timetableSlots.subjectId} IS NOT NULL`);

    return NextResponse.json({
      success: true,
      stats: {
        totalTeachers: teachersList.length,
        totalClassrooms: classroomsList.length,
        totalSubjects: subjectsList.length,
        totalSlots: totalSlots.count,
        lockedSlots: lockedSlots.count,
        filledSlots: filledSlots.count,
      },
      teachers: teachersList,
      classrooms: classroomsList,
      subjects: subjectsList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch master data" },
      { status: 500 }
    );
  }
}
