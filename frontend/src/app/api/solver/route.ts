import { NextResponse } from "next/server";
import { generateSchedule } from "@/db/scheduler-service";
import { db } from "@/db";
import { timetableSlots, classrooms, teachers, subjects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/solver/status?versionId=draft-v1
 * Mengambil ringkasan jadwal dan metrik kualitas saat ini
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get("versionId") || "draft-v1";

    const [slotCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timetableSlots)
      .where(eq(timetableSlots.versionId, versionId));

    const [lockedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timetableSlots)
      .where(
        sql`${timetableSlots.versionId} = ${versionId} AND ${timetableSlots.isLocked} = 1`
      );

    return NextResponse.json({
      success: true,
      versionId,
      totalSlots: slotCount.count,
      lockedSlots: lockedCount.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get solver status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/solver/run
 * Memicu eksekusi penyusunan jadwal otomatis
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const versionId = body.versionId || "draft-v1";
    const saveToDb = body.saveToDb ?? true;

    const result = await generateSchedule({ versionId, saveToDb });

    return NextResponse.json({
      success: result.success,
      versionId: result.versionId,
      executionTimeMs: result.executionTimeMs,
      totalSlots: result.slots.length,
      conflictsCount: result.conflicts.length,
      conflicts: result.conflicts,
      score: result.score,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Solver generation failed" },
      { status: 500 }
    );
  }
}
