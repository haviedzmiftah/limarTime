import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects, timetableSlots, teachingAssignments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/admin/subjects
 * Tambah mata pelajaran baru
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, targetJpPerWeek, roomType, isMorningPriority, splitPattern } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Kode dan Nama Mata Pelajaran wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Periksa apakah kode mapel sudah ada
    const existing = await db
      .select()
      .from(subjects)
      .where(eq(subjects.code, cleanCode))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Kode mapel '${cleanCode}' sudah digunakan untuk mata pelajaran '${existing[0].name}'.` },
        { status: 400 }
      );
    }

    // Buat id unik
    const newId = `SUB-${cleanCode}`;

    await db.insert(subjects).values({
      id: newId,
      code: cleanCode,
      name: name.trim(),
      targetJpPerWeek: Number(targetJpPerWeek) || 2,
      roomType: roomType || "Reguler",
      isMorningPriority: Boolean(isMorningPriority),
      splitPattern: splitPattern ? JSON.stringify(splitPattern) : "[2]",
    });

    return NextResponse.json({
      success: true,
      message: `Mata pelajaran '${name.trim()}' (${cleanCode}) berhasil ditambahkan.`,
      subject: {
        id: newId,
        code: cleanCode,
        name: name.trim(),
        targetJpPerWeek: Number(targetJpPerWeek) || 2,
        roomType: roomType || "Reguler",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menambahkan mata pelajaran." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/subjects
 * Update mata pelajaran
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, targetJpPerWeek, roomType, isMorningPriority, splitPattern } = body;

    if (!id || !code || !name) {
      return NextResponse.json(
        { success: false, error: "ID, Kode, dan Nama Mata Pelajaran wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Pastikan data mapel ada
    const target = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
    if (target.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data mata pelajaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Cek duplikasi kode dengan mapel lain
    const conflict = await db
      .select()
      .from(subjects)
      .where(eq(subjects.code, cleanCode))
      .limit(1);

    if (conflict.length > 0 && conflict[0].id !== id) {
      return NextResponse.json(
        { success: false, error: `Kode mapel '${cleanCode}' sudah digunakan oleh mapel lain.` },
        { status: 400 }
      );
    }

    await db
      .update(subjects)
      .set({
        code: cleanCode,
        name: name.trim(),
        targetJpPerWeek: Number(targetJpPerWeek) || 2,
        roomType: roomType || target[0].roomType || "Reguler",
        isMorningPriority: isMorningPriority !== undefined ? Boolean(isMorningPriority) : target[0].isMorningPriority,
        splitPattern: splitPattern ? JSON.stringify(splitPattern) : target[0].splitPattern,
      })
      .where(eq(subjects.id, id));

    return NextResponse.json({
      success: true,
      message: `Mata pelajaran '${name.trim()}' (${cleanCode}) berhasil diperbarui.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui data mata pelajaran." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/subjects?id=SUB-01
 * Hapus mata pelajaran dan lepaskan referensi slot
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter ID mata pelajaran wajib disertakan." },
        { status: 400 }
      );
    }

    const target = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
    if (target.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data mata pelajaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Set slot subjectId ke null
    await db
      .update(timetableSlots)
      .set({ subjectId: null })
      .where(eq(timetableSlots.subjectId, id));

    // Hapus relasi pembagian tugas
    await db
      .delete(teachingAssignments)
      .where(eq(teachingAssignments.subjectId, id));

    // Hapus mapel
    await db.delete(subjects).where(eq(subjects.id, id));

    return NextResponse.json({
      success: true,
      message: `Mata pelajaran '${target[0].name}' (${target[0].code}) berhasil dihapus.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus mata pelajaran." },
      { status: 500 }
    );
  }
}
