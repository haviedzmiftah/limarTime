import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachers, timetableSlots, teachingAssignments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/admin/teachers
 * Tambah guru baru
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, nip, mainSubject, maxJpPerWeek, maxJpPerDay, notes } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Kode inisial dan Nama Lengkap guru wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Cek apakah kode guru sudah digunakan
    const existing = await db
      .select()
      .from(teachers)
      .where(eq(teachers.code, cleanCode))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Kode guru '${cleanCode}' sudah digunakan oleh ${existing[0].name}.` },
        { status: 400 }
      );
    }

    // Hitung nomor urut berikutnya
    const [maxNoResult] = await db
      .select({ maxNo: sql<number>`max(${teachers.no})` })
      .from(teachers);
    const nextNo = (maxNoResult?.maxNo || 0) + 1;
    const newId = `T${String(nextNo).padStart(2, "0")}`;

    await db.insert(teachers).values({
      id: newId,
      no: nextNo,
      code: cleanCode,
      name: name.trim(),
      nip: nip ? nip.trim() : null,
      mainSubject: mainSubject ? mainSubject.trim() : null,
      maxJpPerWeek: maxJpPerWeek ? Number(maxJpPerWeek) : 30,
      maxJpPerDay: maxJpPerDay ? Number(maxJpPerDay) : 6,
      notes: notes ? notes.trim() : null,
    });

    return NextResponse.json({
      success: true,
      message: `Guru ${name.trim()} (${cleanCode}) berhasil ditambahkan.`,
      teacher: {
        id: newId,
        code: cleanCode,
        name: name.trim(),
        nip: nip ? nip.trim() : null,
        mainSubject: mainSubject ? mainSubject.trim() : null,
        maxJpPerWeek: maxJpPerWeek ? Number(maxJpPerWeek) : 30,
        maxJpPerDay: maxJpPerDay ? Number(maxJpPerDay) : 6,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menambahkan guru." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/teachers
 * Update data guru
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, nip, mainSubject, maxJpPerWeek, maxJpPerDay, notes } = body;

    if (!id || !code || !name) {
      return NextResponse.json(
        { success: false, error: "ID, Kode inisial, dan Nama Guru wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Pastikan guru ada
    const target = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    if (target.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data guru tidak ditemukan." },
        { status: 404 }
      );
    }

    // Pastikan kode tidak bentrok dengan guru lain
    const conflictCode = await db
      .select()
      .from(teachers)
      .where(eq(teachers.code, cleanCode))
      .limit(1);

    if (conflictCode.length > 0 && conflictCode[0].id !== id) {
      return NextResponse.json(
        { success: false, error: `Kode '${cleanCode}' sudah digunakan oleh guru lain.` },
        { status: 400 }
      );
    }

    await db
      .update(teachers)
      .set({
        code: cleanCode,
        name: name.trim(),
        nip: nip ? nip.trim() : null,
        mainSubject: mainSubject ? mainSubject.trim() : null,
        maxJpPerWeek: maxJpPerWeek ? Number(maxJpPerWeek) : 30,
        maxJpPerDay: maxJpPerDay ? Number(maxJpPerDay) : 6,
        notes: notes !== undefined ? notes : target[0].notes,
      })
      .where(eq(teachers.id, id));

    return NextResponse.json({
      success: true,
      message: `Data guru ${name.trim()} (${cleanCode}) berhasil diperbarui.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui data guru." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/teachers?id=T01
 * Hapus guru dan lepaskan penugasan terkait
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter ID guru wajib disertakan." },
        { status: 400 }
      );
    }

    const target = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    if (target.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data guru tidak ditemukan." },
        { status: 404 }
      );
    }

    // Lepaskan referensi guru pada slot jadwal (jadikan NULL agar slot tetap ada)
    await db
      .update(timetableSlots)
      .set({ teacherId: null })
      .where(eq(timetableSlots.teacherId, id));

    // Hapus penugasan mengajar (teaching assignments)
    await db
      .delete(teachingAssignments)
      .where(eq(teachingAssignments.teacherId, id));

    // Hapus guru
    await db.delete(teachers).where(eq(teachers.id, id));

    return NextResponse.json({
      success: true,
      message: `Guru ${target[0].name} (${target[0].code}) berhasil dihapus.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus data guru." },
      { status: 500 }
    );
  }
}
