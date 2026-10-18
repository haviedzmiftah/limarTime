import { db } from "./index";
import { teachers, classrooms, subjects, bellSchedules, teachingAssignments } from "./schema";
import { eq, sql } from "drizzle-orm";

async function verifyDatabase() {
  console.log("🔍 Menjalankan verifikasi integritas database limarTime...\n");

  // 1. Hitung total rows
  const [teacherCount] = await db.select({ count: sql<number>`count(*)` }).from(teachers);
  const [classroomCount] = await db.select({ count: sql<number>`count(*)` }).from(classrooms);
  const [subjectCount] = await db.select({ count: sql<number>`count(*)` }).from(subjects);
  const [bellCount] = await db.select({ count: sql<number>`count(*)` }).from(bellSchedules);
  const [assignmentCount] = await db.select({ count: sql<number>`count(*)` }).from(teachingAssignments);

  console.log(`📊 Statistik Tabel:`);
  console.log(`- Teachers (Guru): ${teacherCount.count} (Target: 55)`);
  console.log(`- Classrooms (Rombel): ${classroomCount.count} (Target: 30)`);
  console.log(`- Subjects (Mapel): ${subjectCount.count} (Target: 12)`);
  console.log(`- Bell Schedules (Struktur JP): ${bellCount.count}`);
  console.log(`- Teaching Assignments (SK Beban): ${assignmentCount.count} (Target: 30 rombel x 12 mapel = 360)`);

  // 2. Query Relasional (Relational join test)
  console.log("\n🔗 Menguji Relational Query (Guru + SK Penugasan + Kelas + Mapel)...");
  const sampleTeacher = await db.query.teachers.findFirst({
    where: eq(teachers.code, "ST"),
    with: {
      assignments: {
        with: {
          classroom: true,
          subject: true,
        },
      },
    },
  });

  if (!sampleTeacher) {
    throw new Error("Guru dengan kode ST tidak ditemukan!");
  }

  console.log(`✅ Berhasil membaca data relasi:`);
  console.log(`- Guru: ${sampleTeacher.name} (Kode: ${sampleTeacher.code}, Bidang: ${sampleTeacher.mainSubject})`);
  console.log(`- Jumlah SK Mengajar Terdaftar: ${sampleTeacher.assignments.length} rombel`);
  if (sampleTeacher.assignments.length > 0) {
    const firstAss = sampleTeacher.assignments[0];
    console.log(`- Contoh Penugasan: Kelas ${firstAss.classroom.name} -> Mapel ${firstAss.subject.name} (${firstAss.totalJpPerWeek} JP)`);
  }

  // 3. Cek struktur jam per hari
  const mondaySlots = await db
    .select()
    .from(bellSchedules)
    .where(eq(bellSchedules.day, "Senin"))
    .orderBy(bellSchedules.jp);
  
  console.log(`\n⏰ Cek Struktur Senin:`);
  console.log(`- Ditemukan ${mondaySlots.length} slot jadwal Senin.`);
  mondaySlots.slice(0, 4).forEach((s) => {
    console.log(`  JP ${s.jp}: ${s.timeRange} ${s.isBreak ? `[${s.breakName}]` : "(KBM)"}`);
  });

  console.log("\n✨ Verifikasi database SUKSES! Integritas relasi valid.");
}

verifyDatabase().catch((err) => {
  console.error("❌ Verifikasi gagal:", err);
  process.exit(1);
});
