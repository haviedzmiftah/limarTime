import { Hono } from "hono";
import { generateSchedule } from "../db/scheduler-service.js";
import { db } from "../db/index.js";
import { timetableSlots } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const solverRouter = new Hono();

/**
 * GET /api/solver/status
 */
solverRouter.get("/status", async (c) => {
  try {
    const versionId = c.req.query("versionId") || "draft-v1";

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

    return c.json({
      success: true,
      versionId,
      totalSlots: slotCount?.count || 0,
      lockedSlots: lockedCount?.count || 0,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || "Failed status" }, 500);
  }
});

/**
 * POST /api/solver/run
 */
solverRouter.post("/run", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const versionId = body.versionId || "draft-v1";
    const saveToDb = body.saveToDb ?? true;

    const result = await generateSchedule({ versionId, saveToDb });

    return c.json({
      success: result.success,
      versionId: result.versionId,
      executionTimeMs: result.executionTimeMs,
      totalSlots: result.slots.length,
      conflictsCount: result.conflicts.length,
      conflicts: result.conflicts,
      score: result.score,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || "Solver failed" }, 500);
  }
});
