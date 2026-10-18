import { Hono } from "hono";
import { db } from "../db/index.js";
import { teachers, classrooms, subjects, timetableSlots } from "../db/schema.js";
import { sql, eq } from "drizzle-orm";

export const masterDataRouter = new Hono();

/**
 * GET /api/admin/master-data
 * Ambil statistik dan data master guru, rombel, mapel
 */
masterDataRouter.get("/master-data", async (c) => {
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

    return c.json({
      success: true,
      stats: {
        totalTeachers: teachersList.length,
        totalClassrooms: classroomsList.length,
        totalSubjects: subjectsList.length,
        totalSlots: totalSlots?.count || 0,
        lockedSlots: lockedSlots?.count || 0,
        filledSlots: filledSlots?.count || 0,
      },
      teachers: teachersList,
      classrooms: classroomsList,
      subjects: subjectsList,
    });
  } catch (error: any) {
    return c.json(
      { success: false, error: error.message || "Failed to fetch master data" },
      500
    );
  }
});
