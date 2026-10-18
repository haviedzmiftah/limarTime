import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * 1. Guru (Teachers)
 * Data 55 guru SMP Negeri 1 Ngawi lengkap dengan kode inisial, NIP, batas JP, dsb.
 */
export const teachers = sqliteTable("teachers", {
  id: text("id").primaryKey(), // e.g., 'T01', 'G01'
  no: integer("no"),
  code: text("code").notNull().unique(), // e.g., 'ST', 'WS', 'HF'
  name: text("name").notNull(),
  nip: text("nip"),
  mainSubject: text("main_subject"), // e.g. 'INF', 'PAI', 'MTK'
  maxJpPerWeek: integer("max_jp_per_week").default(30),
  maxJpPerDay: integer("max_jp_per_day").default(6),
  // JSON array string of unavailable slots: [{ day: "Senin", jp: [1, 2] }]
  unavailableSlots: text("unavailable_slots").default("[]"),
  notes: text("notes"),
});

/**
 * 2. Rombel / Kelas (Classrooms)
 * 30 rombel jenjang 7A–7J, 8A–8J, 9A–9J
 */
export const classrooms = sqliteTable("classrooms", {
  id: text("id").primaryKey(), // e.g., '7A', '8B', '9J'
  name: text("name").notNull().unique(), // e.g., '7A'
  gradeLevel: integer("grade_level").notNull(), // 7, 8, or 9
  orderIndex: integer("order_index").notNull().default(0),
});

/**
 * 3. Mata Pelajaran (Subjects)
 * Mapel kurikulum nasional & muatan lokal, alokasi ruang & pola pemecahan JP
 */
export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(), // e.g., 'SUB-01', 'PAI', 'INF'
  code: text("code").notNull().unique(), // 'BIND', 'MAT', 'INF'
  name: text("name").notNull(),
  targetJpPerWeek: integer("target_jp_per_week").notNull().default(2),
  // JSON string array of standard split pattern, e.g., "[2, 2]" for 4 JP or "[3]" for 3 JP
  splitPattern: text("split_pattern").default("[2]"),
  isMorningPriority: integer("is_morning_priority", { mode: "boolean" }).default(false),
  roomType: text("room_type").default("Reguler"), // 'Reguler' | 'Lab_Komputer' | 'Lab_IPA' | 'Lapangan'
});

/**
 * 4. Jam Pelajaran & Struktur Belajar (Bell Schedules)
 * Mendukung perbedaan durasi JP (40m normal vs 30m Jumat/Ramadhan)
 */
export const bellSchedules = sqliteTable("bell_schedules", {
  id: text("id").primaryKey(), // e.g. 'SENIN-JP1'
  day: text("day").notNull(), // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
  jp: integer("jp").notNull(), // 0 for Upacara, 1..8
  timeRange: text("time_range").notNull(), // '07.00 - 07.40'
  durationMinutes: integer("duration_minutes").notNull().default(40),
  isBreak: integer("is_break", { mode: "boolean" }).default(false),
  breakName: text("break_name"), // 'Upacara', 'Istirahat', 'Literasi/Dhuha/Senam', 'MBG'
});

/**
 * 5. SK Pembagian Tugas Mengajar (Teaching Assignments)
 * Relasi Guru <-> Mapel <-> Rombel (SK Beban Mengajar)
 */
export const teachingAssignments = sqliteTable("teaching_assignments", {
  id: text("id").primaryKey(), // uuid or hash
  teacherId: text("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  classroomId: text("classroom_id").notNull().references(() => classrooms.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  totalJpPerWeek: integer("total_jp_per_week").notNull().default(2),
  // Sesi pembagian, e.g., "[2, 2]"
  sessionSplit: text("session_split").default("[2]"),
});

/**
 * 6. Slot Jadwal Aktif / Terjadwal (Timetable Slots)
 * Jadwal hasil generate solver atau pengeditan interaktif tim kurikulum
 */
export const timetableSlots = sqliteTable("timetable_slots", {
  id: text("id").primaryKey(), // e.g., 'SLOT-7A-SENIN-1'
  versionId: text("version_id").notNull().default("draft-v1"), // 'draft-v1', 'official-final'
  classroomId: text("classroom_id").notNull().references(() => classrooms.id, { onDelete: "cascade" }),
  day: text("day").notNull(), // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
  jp: integer("jp").notNull(), // 1..8
  assignmentId: text("assignment_id").references(() => teachingAssignments.id, { onDelete: "set null" }),
  teacherId: text("teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  subjectId: text("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  room: text("room").default("Kelas"),
  isLocked: integer("is_locked", { mode: "boolean" }).default(false), // slot tidak boleh diacak solver jika true
  conflictFlag: text("conflict_flag"), // null or conflict message if any
});

// Relasi Drizzle
export const teachersRelations = relations(teachers, ({ many }) => ({
  assignments: many(teachingAssignments),
  slots: many(timetableSlots),
}));

export const classroomsRelations = relations(classrooms, ({ many }) => ({
  assignments: many(teachingAssignments),
  slots: many(timetableSlots),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  assignments: many(teachingAssignments),
  slots: many(timetableSlots),
}));

export const teachingAssignmentsRelations = relations(teachingAssignments, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [teachingAssignments.teacherId],
    references: [teachers.id],
  }),
  classroom: one(classrooms, {
    fields: [teachingAssignments.classroomId],
    references: [classrooms.id],
  }),
  subject: one(subjects, {
    fields: [teachingAssignments.subjectId],
    references: [subjects.id],
  }),
  slots: many(timetableSlots),
}));

export const timetableSlotsRelations = relations(timetableSlots, ({ one }) => ({
  classroom: one(classrooms, {
    fields: [timetableSlots.classroomId],
    references: [classrooms.id],
  }),
  teacher: one(teachers, {
    fields: [timetableSlots.teacherId],
    references: [teachers.id],
  }),
  subject: one(subjects, {
    fields: [timetableSlots.subjectId],
    references: [subjects.id],
  }),
  assignment: one(teachingAssignments, {
    fields: [timetableSlots.assignmentId],
    references: [teachingAssignments.id],
  }),
}));
