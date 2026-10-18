import { db } from "./index";
import {
  teachers,
  classrooms,
  subjects,
  bellSchedules,
  teachingAssignments,
} from "./schema";
import * as fs from "fs";
import * as path from "path";

interface RealDataTeacher {
  no: number;
  code: string;
  name: string;
  subject: string;
}

interface RealDataScheduleSlot {
  jp?: number;
  time?: string;
  type?: string;
  name?: string;
}

interface RealDataRoot {
  school_info: {
    name: string;
    sk_number: string;
    semester: string;
    effective_date: string;
    classes_by_grade: {
      [grade: string]: string[];
    };
    daily_schedule_structure: {
      [day: string]: {
        upacara?: string;
        max_jp?: number;
        jp_slots: RealDataScheduleSlot[];
      };
    };
  };
  teachers: RealDataTeacher[];
}

interface MockDataSubject {
  id: string;
  name: string;
  jp_per_week: number;
  split_pattern: number[];
  is_morning_priority: boolean;
}

interface MockDataTeacher {
  id: string;
  name: string;
  subject_id: string;
  subject_name: string;
  assigned_classes: string[];
  total_jp: number;
}

interface MockDataRoot {
  subjects: MockDataSubject[];
  teachers: MockDataTeacher[];
}

async function seed() {
  console.log("🌱 Memulai proses seeding database limarTime...");

  const realDataPath = path.join(process.cwd(), "smpn1_ngawi_real_data.json");
  const mockDataPath = path.join(process.cwd(), "mock_school_data.json");

  const realData: RealDataRoot = JSON.parse(fs.readFileSync(realDataPath, "utf-8"));
  const mockData: MockDataRoot = JSON.parse(fs.readFileSync(mockDataPath, "utf-8"));

  // 1. Seed Classrooms (30 Rombel: 7A-7J, 8A-8J, 9A-9J)
  console.log("🏫 Seeding 30 Rombel Kelas...");
  let order = 1;
  const classroomRows = [];
  for (const [gradeStr, classList] of Object.entries(realData.school_info.classes_by_grade)) {
    const grade = parseInt(gradeStr, 10);
    for (const className of classList) {
      classroomRows.push({
        id: className,
        name: className,
        gradeLevel: grade,
        orderIndex: order++,
      });
    }
  }

  // Bersihkan tabel sebelum seeding
  await db.delete(teachingAssignments);
  await db.delete(teachers);
  await db.delete(classrooms);
  await db.delete(subjects);
  await db.delete(bellSchedules);

  await db.insert(classrooms).values(classroomRows);
  console.log(`✅ Berhasil memasukkan ${classroomRows.length} rombel kelas.`);

  // 2. Seed Subjects
  console.log("📚 Seeding Mata Pelajaran...");
  const subjectCodeMap: Record<string, string> = {
    "SUB-01": "BIND",
    "SUB-02": "MAT",
    "SUB-03": "BING",
    "SUB-04": "IPA",
    "SUB-05": "IPS",
    "SUB-06": "PAI",
    "SUB-07": "PKN",
    "SUB-08": "PJOK",
    "SUB-09": "INF",
    "SUB-10": "SENI",
    "SUB-11": "PRAK",
    "SUB-12": "BDAE",
  };

  const subjectRows = mockData.subjects.map((s) => ({
    id: s.id,
    code: subjectCodeMap[s.id] || s.id,
    name: s.name,
    targetJpPerWeek: s.jp_per_week,
    splitPattern: JSON.stringify(s.split_pattern),
    isMorningPriority: s.is_morning_priority,
    roomType: s.name.includes("Informatika")
      ? "Lab_Komputer"
      : s.name.includes("IPA")
      ? "Lab_IPA"
      : s.name.includes("PJOK")
      ? "Lapangan"
      : "Reguler",
  }));

  await db.insert(subjects).values(subjectRows);
  console.log(`✅ Berhasil memasukkan ${subjectRows.length} mata pelajaran.`);

  // 3. Seed 55 Guru SMPN 1 Ngawi
  console.log("👨‍🏫 Seeding 55 Tenaga Pendidik SMPN 1 Ngawi...");
  const teacherRows = realData.teachers.map((t) => ({
    id: `T${String(t.no).padStart(2, "0")}`,
    no: t.no,
    code: t.code,
    name: t.name,
    nip: t.no === 1 ? "196611071992031006" : null,
    mainSubject: t.subject,
    maxJpPerWeek: 30,
    maxJpPerDay: 6,
    unavailableSlots: "[]",
    notes: `Guru Pengampu Mapel ${t.subject}`,
  }));

  await db.insert(teachers).values(teacherRows);
  console.log(`✅ Berhasil memasukkan ${teacherRows.length} guru.`);

  // 4. Seed Bell Schedules (Struktur JP Harian SMPN 1 Ngawi)
  console.log("⏰ Seeding Jam Pelajaran & Struktur Belajar...");
  const bellRows: Array<{
    id: string;
    day: string;
    jp: number;
    timeRange: string;
    durationMinutes: number;
    isBreak: boolean;
    breakName: string | null;
  }> = [];

  for (const [day, struct] of Object.entries(realData.school_info.daily_schedule_structure)) {
    if (struct.upacara) {
      bellRows.push({
        id: `${day.toUpperCase()}-JP0`,
        day,
        jp: 0,
        timeRange: struct.upacara,
        durationMinutes: 60,
        isBreak: true,
        breakName: "Upacara Bendera",
      });
    }

    let breakCounter = 1;
    for (const slot of struct.jp_slots) {
      if (slot.jp !== undefined) {
        bellRows.push({
          id: `${day.toUpperCase()}-JP${slot.jp}`,
          day,
          jp: slot.jp,
          timeRange: slot.time || "",
          durationMinutes: day === "Jumat" ? 40 : 40,
          isBreak: false,
          breakName: null,
        });
      } else {
        bellRows.push({
          id: `${day.toUpperCase()}-BREAK${breakCounter++}`,
          day,
          jp: -1,
          timeRange: slot.time || "",
          durationMinutes: 30,
          isBreak: true,
          breakName: slot.name || slot.type || "Istirahat",
        });
      }
    }
  }

  await db.insert(bellSchedules).values(bellRows);
  console.log(`✅ Berhasil memasukkan ${bellRows.length} slot jadwal bel.`);

  // 5. Seed Teaching Assignments awal (SK Penugasan)
  console.log("📋 Seeding SK Penugasan Mengajar Awal...");
  const assignmentRows = [];
  let assignId = 1;

  // Petakan penugasan dari mockData teachers yang sudah didesain seimbang (total 38 JP per rombel)
  for (const tMock of mockData.teachers) {
    // Cari guru di real data berdasar ID urut (G01 -> T01)
    const teacherId = `T${tMock.id.replace("G", "").padStart(2, "0")}`;
    const subject = subjectRows.find((s) => s.id === tMock.subject_id);
    const sessionSplit = subject?.splitPattern || "[2]";
    const jpPerClass = subject?.targetJpPerWeek || 2;

    for (const className of tMock.assigned_classes) {
      assignmentRows.push({
        id: `ASSIGN-${String(assignId++).padStart(4, "0")}`,
        teacherId,
        classroomId: className,
        subjectId: tMock.subject_id,
        totalJpPerWeek: jpPerClass,
        sessionSplit,
      });
    }
  }

  await db.insert(teachingAssignments).values(assignmentRows);
  console.log(`✅ Berhasil memasukkan ${assignmentRows.length} penugasan mengajar (SK).`);

  console.log("🎉 Database seeding limarTime selesai dengan sukses!");
}

seed().catch((err) => {
  console.error("❌ Gagal melakukan seeding database:", err);
  process.exit(1);
});
