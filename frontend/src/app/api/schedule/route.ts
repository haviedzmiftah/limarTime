import { NextResponse } from "next/server";
import { db } from "@/db";
import { timetableSlots, classrooms, teachers, subjects, bellSchedules } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { sortByStartTime } from "@/lib/utils";
import { ConflictValidator } from "@/lib/solver/validator";
import { DayStructure, PlacedSlot, TeacherConstraint } from "@/lib/solver/types";

/**
 * GET /api/schedule
 * Query jadwal baik berbasis Kelas maupun berbasis Guru:
 * - ?viewMode=class&className=7A&day=Senin
 * - ?viewMode=teacher&teacherId=T01&day=Senin
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get("viewMode") || "class"; // 'class' | 'teacher'
    const className = searchParams.get("className") || "7A";
    const teacherId = searchParams.get("teacherId") || "T01";
    const day = searchParams.get("day") || "Senin";
    const versionId = searchParams.get("versionId") || "draft-v1";

    // Struktur jam bel hari ini (diurutkan kronologis pagi ke siang)
    const rawBellList = await db
      .select()
      .from(bellSchedules)
      .where(eq(bellSchedules.day, day));

    const bellList = sortByStartTime(rawBellList);

    if (viewMode === "teacher") {
      // Tampilan Grid per Guru
      const teacherSlots = await db
        .select({
          id: timetableSlots.id,
          jp: timetableSlots.jp,
          day: timetableSlots.day,
          classroomId: timetableSlots.classroomId,
          isLocked: timetableSlots.isLocked,
          room: timetableSlots.room,
          conflictFlag: timetableSlots.conflictFlag,
          subjectId: timetableSlots.subjectId,
          subjectName: subjects.name,
          subjectCode: subjects.code,
        })
        .from(timetableSlots)
        .leftJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
        .where(
          and(
            eq(timetableSlots.teacherId, teacherId),
            eq(timetableSlots.day, day),
            eq(timetableSlots.versionId, versionId)
          )
        )
        .orderBy(asc(timetableSlots.jp));

      const teacherInfo = await db.query.teachers.findFirst({
        where: eq(teachers.id, teacherId),
      });

      const scheduleItems = bellList.map((bell) => {
        if (bell.isBreak) {
          return {
            jp: bell.jp === 0 ? "JP 0" : "Break",
            periodNum: bell.jp,
            timeRange: bell.timeRange,
            isBreak: true,
            name: bell.breakName || "Istirahat",
            code: "BREAK",
            teacher: "-",
            classroom: "-",
            room: "-",
            isLocked: true,
          };
        }

        const foundSlot = teacherSlots.find((s) => s.jp === bell.jp);
        return {
          jp: `JP ${bell.jp}`,
          periodNum: bell.jp,
          timeRange: bell.timeRange,
          isBreak: false,
          slotId: foundSlot?.id || null,
          name: foundSlot ? `${foundSlot.subjectName} (Kelas ${foundSlot.classroomId})` : "Bebas / Kosong",
          code: foundSlot?.subjectCode || "-",
          teacher: teacherInfo?.name || "-",
          teacherCode: teacherInfo?.code || "-",
          classroom: foundSlot?.classroomId || "-",
          room: foundSlot?.room || "Kelas",
          isLocked: foundSlot?.isLocked || false,
          conflictFlag: foundSlot?.conflictFlag || null,
        };
      });

      return NextResponse.json({
        success: true,
        viewMode: "teacher",
        teacherId,
        teacherName: teacherInfo?.name,
        teacherCode: teacherInfo?.code,
        day,
        versionId,
        schedule: scheduleItems,
      });
    }

    // Default: Tampilan Grid per Kelas
    const slots = await db
      .select({
        id: timetableSlots.id,
        jp: timetableSlots.jp,
        day: timetableSlots.day,
        isLocked: timetableSlots.isLocked,
        room: timetableSlots.room,
        conflictFlag: timetableSlots.conflictFlag,
        teacherId: timetableSlots.teacherId,
        teacherName: teachers.name,
        teacherCode: teachers.code,
        subjectId: timetableSlots.subjectId,
        subjectName: subjects.name,
        subjectCode: subjects.code,
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
      )
      .orderBy(asc(timetableSlots.jp));

    const scheduleItems = bellList.map((bell) => {
      if (bell.isBreak) {
        return {
          jp: bell.jp === 0 ? "JP 0" : "Break",
          periodNum: bell.jp,
          timeRange: bell.timeRange,
          isBreak: true,
          name: bell.breakName || "Istirahat",
          code: "BREAK",
          teacher: "-",
          room: "-",
          isLocked: true,
        };
      }

      const foundSlot = slots.find((s) => s.jp === bell.jp);
      return {
        jp: `JP ${bell.jp}`,
        periodNum: bell.jp,
        timeRange: bell.timeRange,
        isBreak: false,
        slotId: foundSlot?.id || null,
        name: foundSlot?.subjectName || "Jam Kosong / Mandiri",
        code: foundSlot?.subjectCode || "-",
        teacher: foundSlot?.teacherName ? `${foundSlot.teacherName} (${foundSlot.teacherCode})` : "-",
        teacherId: foundSlot?.teacherId || null,
        room: foundSlot?.room || "Kelas",
        isLocked: foundSlot?.isLocked || false,
        conflictFlag: foundSlot?.conflictFlag || null,
      };
    });

    return NextResponse.json({
      success: true,
      viewMode: "class",
      className,
      day,
      versionId,
      totalItems: scheduleItems.length,
      schedule: scheduleItems,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schedule
 * Menukar (Swap) dua slot jam pelajaran secara interaktif atau memindahkan slot
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { slotId1, slotId2, versionId = "draft-v1" } = body;

    if (!slotId1 || !slotId2) {
      return NextResponse.json(
        { success: false, error: "slotId1 and slotId2 are required for swap" },
        { status: 400 }
      );
    }

    const slot1 = await db.query.timetableSlots.findFirst({
      where: and(eq(timetableSlots.id, slotId1), eq(timetableSlots.versionId, versionId)),
    });

    const slot2 = await db.query.timetableSlots.findFirst({
      where: and(eq(timetableSlots.id, slotId2), eq(timetableSlots.versionId, versionId)),
    });

    if (!slot1 || !slot2) {
      return NextResponse.json(
        { success: false, error: "One or both slots not found" },
        { status: 404 }
      );
    }

    if (slot1.isLocked || slot2.isLocked) {
      return NextResponse.json(
        { success: false, error: "Cannot swap locked slots" },
        { status: 400 }
      );
    }

    // Tukar assignment, teacher, subject, room antar dua slot
    await db
      .update(timetableSlots)
      .set({
        assignmentId: slot2.assignmentId,
        teacherId: slot2.teacherId,
        subjectId: slot2.subjectId,
        room: slot2.room,
      })
      .where(eq(timetableSlots.id, slot1.id));

    await db
      .update(timetableSlots)
      .set({
        assignmentId: slot1.assignmentId,
        teacherId: slot1.teacherId,
        subjectId: slot1.subjectId,
        room: slot1.room,
      })
      .where(eq(timetableSlots.id, slot2.id));

    return NextResponse.json({
      success: true,
      message: "Slots successfully swapped",
      swapped: [slotId1, slotId2],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Swap operation failed" },
      { status: 500 }
    );
  }
}
