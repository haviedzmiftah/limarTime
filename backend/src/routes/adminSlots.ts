import { Hono } from "hono";
import { db } from "../db/index.js";
import { timetableSlots } from "../db/schema.js";
import { and, eq } from "drizzle-orm";

export const adminSlotsRouter = new Hono();

/**
 * GET /api/admin/schedule-slots
 */
adminSlotsRouter.get("/", async (c) => {
  try {
    const className = c.req.query("className") || "7A";
    const day = c.req.query("day") || "Senin";
    const versionId = c.req.query("versionId") || "draft-v1";

    const slots = await db
      .select()
      .from(timetableSlots)
      .where(
        and(
          eq(timetableSlots.classroomId, className),
          eq(timetableSlots.day, day),
          eq(timetableSlots.versionId, versionId)
        )
      );

    return c.json({ success: true, className, day, versionId, slots });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || "Failed to fetch slots" }, 500);
  }
});

/**
 * POST /api/admin/schedule-slots
 */
adminSlotsRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
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
      return c.json({ success: false, error: "classroomId, day, and jp are required" }, 400);
    }

    const slotId = `SLOT-${classroomId}-${day.toUpperCase()}-${jp}`;

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

      return c.json({ success: true, message: "Slot berhasil diperbarui", slotId: existing.id });
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

      return c.json({ success: true, message: "Slot baru berhasil dibuat", slotId });
    }
  } catch (error: any) {
    return c.json({ success: false, error: error.message || "Failed to save slot" }, 500);
  }
});

/**
 * PATCH /api/admin/schedule-slots (Toggle Lock)
 */
adminSlotsRouter.patch("/", async (c) => {
  try {
    const body = await c.req.json();
    const { slotId, isLocked } = body;

    if (!slotId) {
      return c.json({ success: false, error: "slotId is required" }, 400);
    }

    await db
      .update(timetableSlots)
      .set({ isLocked: Boolean(isLocked) })
      .where(eq(timetableSlots.id, slotId));

    return c.json({
      success: true,
      message: `Status kunci slot berhasil diubah (${isLocked ? "Terkunci" : "Terbuka"})`,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || "Failed to lock slot" }, 500);
  }
});

/**
 * DELETE /api/admin/schedule-slots (Clear slot)
 */
adminSlotsRouter.delete("/", async (c) => {
  try {
    const slotId = c.req.query("slotId");
    if (!slotId) {
      return c.json({ success: false, error: "slotId is required" }, 400);
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

    return c.json({ success: true, message: "Slot berhasil dikosongkan" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || "Failed to clear slot" }, 500);
  }
});
