export interface Stats {
  totalTeachers: number;
  totalClassrooms: number;
  totalSubjects: number;
  totalSlots: number;
  lockedSlots: number;
  filledSlots: number;
}

export interface Teacher {
  id: string;
  code: string;
  name: string;
  nip: string | null;
  mainSubject: string | null;
  maxJpPerWeek: number | null;
  maxJpPerDay: number | null;
}

export interface Classroom {
  id: string;
  name: string;
  gradeLevel: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  targetJpPerWeek: number;
  roomType: string | null;
}

export interface ScheduleSlot {
  jp: string;
  periodNum: number;
  timeRange: string;
  isBreak: boolean;
  slotId: string | null;
  name: string;
  code: string;
  teacher: string;
  teacherId: string | null;
  room: string;
  isLocked: boolean;
  conflictFlag: string | null;
}

export interface BellSchedule {
  id: string;
  day: string;
  jp: number;
  timeRange: string;
  durationMinutes: number;
  isBreak: boolean;
  breakName: string | null;
}

export interface ToastMessage {
  text: string;
  type: "success" | "error";
}

