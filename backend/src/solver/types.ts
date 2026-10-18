/**
 * limarTime Intelligent Scheduling Solver Engine - Types & Interfaces
 */

export interface TimeSlot {
  day: string;
  jp: number; // 1..max_jp
  timeRange: string;
  isBreak: boolean;
  breakName?: string | null;
}

export interface DayStructure {
  day: string;
  maxJp: number;
  availableJp: number[]; // e.g. [1, 2, 3, 4, 5, 6]
}

export interface TeacherConstraint {
  id: string;
  code: string;
  name: string;
  maxJpPerWeek: number;
  maxJpPerDay: number;
  unavailableSlots: Array<{ day: string; jp: number }>;
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
  splitPattern: number[]; // e.g. [2, 2] or [3] or [2]
  isMorningPriority: boolean;
  roomType: string;
}

export interface Assignment {
  id: string;
  teacherId: string;
  classroomId: string;
  subjectId: string;
  totalJpPerWeek: number;
  sessionSplit: number[];
}

/**
 * Unit terkecil sesi mengajar (misal: Sesi 2 JP Matematika untuk 7A oleh Pak Guru X)
 */
export interface LessonSession {
  sessionId: string; // e.g. ASSIGN-0001-S1
  assignmentId: string;
  teacherId: string;
  classroomId: string;
  subjectId: string;
  durationJp: number; // 2, 3, etc.
  isMorningPriority: boolean;
  roomType: string;
}

export interface PlacedSlot {
  id: string;
  versionId: string;
  classroomId: string;
  day: string;
  jp: number;
  assignmentId: string;
  teacherId: string;
  subjectId: string;
  room: string;
  isLocked: boolean;
  conflictFlag?: string | null;
}

export interface ConflictReport {
  type: "TEACHER_DOUBLE_BOOKING" | "CLASSROOM_DOUBLE_BOOKING" | "ROOM_OVER_CAPACITY" | "UNAVAILABLE_SLOT" | "MAX_DAILY_EXCEEDED";
  message: string;
  day: string;
  jp: number;
  entityId: string;
  conflictingSlots: PlacedSlot[];
}

export interface OptimizationScore {
  hardScore: number; // Harus 0 (zero violations) untuk valid
  softScore: number; // Skor kualitas (semakin tinggi semakin baik, misal 0-100)
  totalAssignedJp: number;
  totalTargetJp: number;
  metrics: {
    morningPriorityFulfilled: number;
    morningPriorityTotal: number;
    teacherGapsCount: number;
    splitSpreadFulfilled: number;
  };
}

export interface SolverResult {
  success: boolean;
  versionId: string;
  slots: PlacedSlot[];
  conflicts: ConflictReport[];
  score: OptimizationScore;
  executionTimeMs: number;
}
