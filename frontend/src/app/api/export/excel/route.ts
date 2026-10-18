import { NextResponse } from "next/server";
import { db } from "@/db";
import { timetableSlots, classrooms, teachers, subjects, bellSchedules } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import * as XLSX from "xlsx";

/**
 * GET /api/export/excel?versionId=draft-v1
 * Mengunduh Master Timetable Matrix SMPN 1 Ngawi format Excel .xlsx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get("versionId") || "draft-v1";

    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    // Ambil seluruh data
    const allClassrooms = await db.select().from(classrooms).orderBy(asc(classrooms.orderIndex));
    const allSlots = await db
      .select({
        classroomId: timetableSlots.classroomId,
        day: timetableSlots.day,
        jp: timetableSlots.jp,
        teacherCode: teachers.code,
        teacherName: teachers.name,
        subjectCode: subjects.code,
        subjectName: subjects.name,
        room: timetableSlots.room,
      })
      .from(timetableSlots)
      .leftJoin(teachers, eq(timetableSlots.teacherId, teachers.id))
      .leftJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
      .where(eq(timetableSlots.versionId, versionId));

    // Siapkan Workbook Excel
    const wb = XLSX.utils.book_new();

    // 1. Sheet Master Matriks Jadwal Semua Rombel
    const masterData: any[][] = [
      ["JADWAL INDUK PEMBELAJARAN (MASTER TIMETABLE)"],
      ["SMP NEGERI 1 NGAWI - TAHUN AJARAN 2026/2027"],
      [`Versi Jadwal: ${versionId.toUpperCase()}`],
      [],
    ];

    // Header Kolom: Hari, JP, lalu tiap Kelas (7A..9J)
    const headerRow = ["HARI", "JP", ...allClassrooms.map((c) => `KELAS ${c.name}`)];
    masterData.push(headerRow);

    for (const day of days) {
      const maxJp = day === "Kamis" ? 8 : day === "Jumat" ? 4 : day === "Senin" ? 6 : 7;

      for (let jp = 1; jp <= maxJp; jp++) {
        const row = [day, `JP ${jp}`];

        for (const cls of allClassrooms) {
          const match = allSlots.find(
            (s) => s.day === day && s.jp === jp && s.classroomId === cls.name
          );

          if (match && match.subjectCode) {
            row.push(`${match.subjectCode} (${match.teacherCode || "-"})`);
          } else {
            row.push("-");
          }
        }
        masterData.push(row);
      }
    }

    const wsMaster = XLSX.utils.aoa_to_sheet(masterData);
    XLSX.utils.book_append_sheet(wb, wsMaster, "Master Matriks");

    // 2. Sheet Rekapitulasi Beban Mengajar Guru
    const allTeachers = await db.select().from(teachers).orderBy(asc(teachers.no));
    const teacherData: any[][] = [
      ["REKAPITULASI BEBAN MENGAJAR GURU"],
      ["SMP NEGERI 1 NGAWI"],
      [],
      ["NO", "KODE", "NAMA GURU", "NIP", "MAPEL UTAMA", "TOTAL JP TERJADWAL"],
    ];

    for (const t of allTeachers) {
      const teacherSlots = allSlots.filter((s) => s.teacherCode === t.code);
      teacherData.push([
        t.no,
        t.code,
        t.name,
        t.nip || "-",
        t.mainSubject || "-",
        teacherSlots.length,
      ]);
    }

    const wsTeacher = XLSX.utils.aoa_to_sheet(teacherData);
    XLSX.utils.book_append_sheet(wb, wsTeacher, "Beban Mengajar Guru");

    // Generate Buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Master_Jadwal_SMPN1_Ngawi_${versionId}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}
