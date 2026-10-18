import { NextResponse } from "next/server";
import { db } from "@/db";
import { timetableSlots, classrooms, teachers, subjects, bellSchedules } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * GET /api/admin/schedule-slots
 * Ambil daftar slot dengan filter kelas dan hari
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get("className") || "7A";
    const day = searchParams.get("day") || "Senin";
    const versionId = searchParams.get("versionId") || "draft-v1";

    const slots = await db
      .select({
        id: timetableSlots.id,
        versionId: timetableSlots.versionId,
        classroomId: timetableSlots.classroomId,
        day: timetableSlots.day,
        jp: timetableSlots.jp,
        assignmentId: timetableSlots.assignmentId,
        teacherId: timetableSlots.teacherId,
        teacherName: teachers.name,
        teacherCode: teachers.code,
        subjectId: timetableSlots.subjectId,
        subjectName: subjects.name,
        subjectCode: subjects.code,
        room: timetableSlots.room,
        isLocked: timetableSlots.isLocked,
        conflictFlag: timetableSlots.conflictFlag,
      })
      .from(timetableSlots)
      .leftJoin(teachers, eq(timetableSlots.teacherId, teachers.id))
      .leftJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
      .where(
        and(
          eq(timetableSlots.classroomId, className),
          eq(timetableSlots.day, day),
          eq(timetableSlots.versionId, versionId)
        )
      );

    return NextResponse.json({
      success: true,
      className,
      day,
      versionId,
      slots,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/schedule-slots
 * Update / assign slot spesifik
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      classroomId,
      day,
      jp,
      teacherId,
      subjectId,
      room = "Kelas",
      isLocked = false,
      versionId = "draft-v1",
    } = body;

    if (!classroomId || !day || jp === undefined) {
      return NextResponse.json(
        { success: false, error: "classroomId, day, and jp are required" },
        { status: 400 }
      );
    }

    const slotId = `SLOT-${classroomId}-${day.toUpperCase()}-${jp}`;

    // Cek apakah slot sudah ada
    const existing = await db.query.timetableSlots.findFirst({
      where: and(
        eq(timetableSlots.classroomId, classroomId),
        eq(timetableSlots.day, day),
        eq(timetableSlots.jp, jp),
        eq(timetableSlots.versionId, versionId)
      ),
    });

    if (existing) {
      await db
        .update(timetableSlots)
        .set({
          teacherId: teacherId || null,
          subjectId: subjectId || null,
          room,
          isLocked: Boolean(isLocked),
          conflictFlag: null,
        })
        .where(eq(timetableSlots.id, existing.id));

      return NextResponse.json({
        success: true,
        message: "Slot berhasil diperbarui",
        slotId: existing.id,
      });
    } else {
      await db.insert(timetableSlots).values({
        id: slotId,
        versionId,
        classroomId,
        day,
        jp,
        teacherId: teacherId || null,
        subjectId: subjectId || null,
        room,
        isLocked: Boolean(isLocked),
        conflictFlag: null,
      });

      return NextResponse.json({
        success: true,
        message: "Slot baru berhasil dibuat",
        slotId,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save slot" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/schedule-slots
 * Toggle Lock/Unlock slot
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { slotId, isLocked } = body;

    if (!slotId) {
      return NextResponse.json(
        { success: false, error: "slotId is required" },
        { status: 400 }
      );
    }

    await db
      .update(timetableSlots)
      .set({ isLocked: Boolean(isLocked) })
      .where(eq(timetableSlots.id, slotId));

    return NextResponse.json({
      success: true,
      message: `Status kunci slot berhasil diubah (${isLocked ? "Terkunci" : "Terbuka"})`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update slot status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/schedule-slots
 * Reset atau kosongkan slot
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get("slotId");

    if (!slotId) {
      return NextResponse.json(
        { success: false, error: "slotId is required" },
        { status: 400 }
      );
    }

    await db
      .update(timetableSlots)
      .set({
        teacherId: null,
        subjectId: null,
        assignmentId: null,
        room: "Kelas",
        conflictFlag: null,
      })
      .where(eq(timetableSlots.id, slotId));

    return NextResponse.json({
      success: true,
      message: "Slot berhasil dikosongkan",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear slot" },
      { status: 500 }
    );
  }
}
