import { db } from "./index";
import {
  teachers,
  classrooms,
  subjects,
  bellSchedules,
  teachingAssignments,
  timetableSlots,
} from "./schema";
import { eq } from "drizzle-orm";
import { SchedulingSolver } from "../lib/solver/engine";
import {
  DayStructure,
  TeacherConstraint,
  Classroom,
  Subject,
  Assignment,
  PlacedSlot,
  SolverResult,
} from "../lib/solver/types";

export interface GenerateScheduleOptions {
  versionId?: string;
  saveToDb?: boolean;
}

export async function generateSchedule(
  options: GenerateScheduleOptions = {}
): Promise<SolverResult> {
  const versionId = options.versionId || "draft-v1";
  const saveToDb = options.saveToDb ?? true;

  console.log(`🚀 Menyiapkan data master untuk Solver Engine (${versionId})...`);

  // 1. Ambil data guru
  const teacherRows = await db.select().from(teachers);
  const teacherConstraints: TeacherConstraint[] = teacherRows.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    maxJpPerWeek: t.maxJpPerWeek || 30,
    maxJpPerDay: t.maxJpPerDay || 6,
    unavailableSlots: JSON.parse(t.unavailableSlots || "[]"),
  }));

  // 2. Ambil data rombel kelas
  const classroomRows = await db.select().from(classrooms);
  const classroomList: Classroom[] = classroomRows.map((c) => ({
    id: c.id,
    name: c.name,
    gradeLevel: c.gradeLevel,
  }));

  // 3. Ambil data mata pelajaran
  const subjectRows = await db.select().from(subjects);
  const subjectList: Subject[] = subjectRows.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    targetJpPerWeek: s.targetJpPerWeek,
    splitPattern: JSON.parse(s.splitPattern || "[2]"),
    isMorningPriority: Boolean(s.isMorningPriority),
    roomType: s.roomType || "Reguler",
  }));

  // 4. Ambil struktur hari dan JP
  const bellRows = await db.select().from(bellSchedules).where(eq(bellSchedules.isBreak, false));
  const dayJpMap = new Map<string, number[]>();
  for (const b of bellRows) {
    const list = dayJpMap.get(b.day) || [];
    list.push(b.jp);
    dayJpMap.set(b.day, list);
  }

  const dayStructures: DayStructure[] = Array.from(dayJpMap.entries()).map(([day, jps]) => ({
    day,
    maxJp: Math.max(...jps),
    availableJp: jps.sort((a, b) => a - b),
  }));

  // 5. Ambil data penugasan mengajar (SK)
  const assignmentRows = await db.select().from(teachingAssignments);
  const assignmentList: Assignment[] = assignmentRows.map((a) => ({
    id: a.id,
    teacherId: a.teacherId,
    classroomId: a.classroomId,
    subjectId: a.subjectId,
    totalJpPerWeek: a.totalJpPerWeek,
    sessionSplit: JSON.parse(a.sessionSplit || "[2]"),
  }));

  // 6. Jalankan Solver Engine
  console.log(`🧠 Menjalankan Heuristic CSP Scheduling Solver...`);
  const solver = new SchedulingSolver({
    versionId,
    dayStructures,
    classrooms: classroomList,
    subjects: subjectList,
    teachers: teacherConstraints,
    assignments: assignmentList,
  });

  const result = solver.solve();
  console.log(`✨ Solver selesai dalam ${result.executionTimeMs}ms!`);
  console.log(`- Status: ${result.success ? "SUKSES" : "SELESAI DENGAN CATATAN"}`);
  console.log(`- Total Slot Terjadwal: ${result.slots.length} / ${result.score.totalTargetJp} JP`);
  console.log(`- Jumlah Konflik / Bentrok: ${result.conflicts.length}`);
  console.log(`- Skor Optimasi: ${result.score.softScore}/100`);

  // 7. Simpan ke database jika diminta
  if (saveToDb && result.slots.length > 0) {
    console.log(`💾 Menyimpan ${result.slots.length} slot jadwal ke tabel timetable_slots...`);
    // Hapus draft sebelumnya dengan versionId yang sama
    await db.delete(timetableSlots).where(eq(timetableSlots.versionId, versionId));

    // Batch insert
    const chunkSize = 100;
    for (let i = 0; i < result.slots.length; i += chunkSize) {
      const chunk = result.slots.slice(i, i + chunkSize).map((s) => ({
        id: s.id,
        versionId: s.versionId,
        classroomId: s.classroomId,
        day: s.day,
        jp: s.jp,
        assignmentId: s.assignmentId,
        teacherId: s.teacherId,
        subjectId: s.subjectId,
        room: s.room,
        isLocked: s.isLocked,
        conflictFlag: s.conflictFlag || null,
      }));
      await db.insert(timetableSlots).values(chunk);
    }
    console.log(`✅ Berhasil menyimpan jadwal ${versionId} ke database!`);
  }

  return result;
}
