import { NextResponse } from "next/server";
import { db } from "@/db";
import { bellSchedules, timetableSlots } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { sortByStartTime } from "@/lib/utils";

/**
 * GET /api/admin/bell-schedules
 * Mengambil seluruh jadwal jam bel (bell schedules) per hari atau seluruhnya
 * Diurutkan dari pagi ke siang berdasarkan rentang jam (timeRange)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");

    let query = db.select().from(bellSchedules);

    if (day) {
      const list = await query.where(eq(bellSchedules.day, day));
      const sortedList = sortByStartTime(list);
      return NextResponse.json({ success: true, bellSchedules: sortedList });
    }

    const list = await query.orderBy(asc(bellSchedules.day));
    const sortedList = sortByStartTime(list);
    return NextResponse.json({ success: true, bellSchedules: sortedList });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat jadwal jam bel" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/bell-schedules
 * Tambah jam pelajaran atau jam istirahat baru pada hari tertentu
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { day, jp, timeRange, durationMinutes, isBreak, breakName } = body;

    if (!day || jp === undefined || !timeRange) {
      return NextResponse.json(
        { success: false, error: "Hari, JP, dan Rentang Waktu wajib diisi." },
        { status: 400 }
      );
    }

    const cleanDay = day.trim();
    const jpNum = Number(jp);
    const newId = `${cleanDay.toUpperCase()}-JP${jpNum}`;

    // Cek apakah slot JP di hari tersebut sudah ada
    const existing = await db
      .select()
      .from(bellSchedules)
      .where(and(eq(bellSchedules.day, cleanDay), eq(bellSchedules.jp, jpNum)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `JP ${jpNum} pada hari ${cleanDay} sudah terdaftar.` },
        { status: 400 }
      );
    }

    await db.insert(bellSchedules).values({
      id: newId,
      day: cleanDay,
      jp: jpNum,
      timeRange: timeRange.trim(),
      durationMinutes: Number(durationMinutes) || 40,
      isBreak: Boolean(isBreak),
      breakName: isBreak ? (breakName ? breakName.trim() : "Istirahat") : null,
    });

    return NextResponse.json({
      success: true,
      message: `Jam belajar ${cleanDay} JP ${jpNum} (${timeRange}) berhasil ditambahkan.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menambahkan jam belajar." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/bell-schedules
 * Perbarui waktu (rentang jam, durasi, status istirahat) jam pelajaran
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, day, jp, timeRange, durationMinutes, isBreak, breakName } = body;

    if (!id || !timeRange) {
      return NextResponse.json(
        { success: false, error: "ID dan Rentang Waktu wajib diisi." },
        { status: 400 }
      );
    }

    const target = await db
      .select()
      .from(bellSchedules)
      .where(eq(bellSchedules.id, id))
      .limit(1);

    if (target.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data jam pelajaran tidak ditemukan." },
        { status: 404 }
      );
    }

    await db
      .update(bellSchedules)
      .set({
        timeRange: timeRange.trim(),
        durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : target[0].durationMinutes,
        isBreak: isBreak !== undefined ? Boolean(isBreak) : target[0].isBreak,
        breakName: isBreak ? (breakName ? breakName.trim() : "Istirahat") : null,
      })
      .where(eq(bellSchedules.id, id));

    return NextResponse.json({
      success: true,
      message: `Jam belajar ${target[0].day} JP ${target[0].jp} berhasil diperbarui.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui jam belajar." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/bell-schedules?id=SENIN-JP1
 * Hapus jam pelajaran dan bersihkan slot jadwal yang terkait
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter ID jam pelajaran wajib disertakan." },
        { status: 400 }
      );
    }

    const target = await db
      .select()
      .from(bellSchedules)
      .where(eq(bellSchedules.id, id))
      .limit(1);

    if (target.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data jam pelajaran tidak ditemukan." },
        { status: 404 }
      );
    }

    const deleted = target[0];

    // Hapus juga slot di timetableSlots yang berada pada hari dan JP tersebut
    await db
      .delete(timetableSlots)
      .where(
        and(eq(timetableSlots.day, deleted.day), eq(timetableSlots.jp, deleted.jp))
      );

    // Hapus bell schedule
    await db.delete(bellSchedules).where(eq(bellSchedules.id, id));

    return NextResponse.json({
      success: true,
      message: `Jam belajar ${deleted.day} JP ${deleted.jp} (${deleted.timeRange}) berhasil dihapus.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus jam belajar." },
      { status: 500 }
    );
  }
}
