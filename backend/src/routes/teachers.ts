import { Hono } from "hono";
import { db } from "../db/index.js";
import { teachers } from "../db/schema.js";
import { asc } from "drizzle-orm";

export const teachersRouter = new Hono();

/**
 * GET /api/teachers
 */
teachersRouter.get("/", async (c) => {
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

    return c.json({
      success: true,
      total: list.length,
      teachers: list,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || "Failed to fetch teachers" }, 500);
  }
});
