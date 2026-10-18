import {
  DayStructure,
  TeacherConstraint,
  Classroom,
  Subject,
  Assignment,
  LessonSession,
  PlacedSlot,
  SolverResult,
} from "./types";
import { ConflictValidator } from "./validator";
import { Scorer } from "./scorer";

export interface SolverInput {
  versionId: string;
  dayStructures: DayStructure[];
  classrooms: Classroom[];
  subjects: Subject[];
  teachers: TeacherConstraint[];
  assignments: Assignment[];
  lockedSlots?: PlacedSlot[];
}

export class SchedulingSolver {
  private versionId: string;
  private dayStructures: DayStructure[];
  private classrooms: Classroom[];
  private subjects: Subject[];
  private teachersMap: Map<string, TeacherConstraint>;
  private subjectsMap: Map<string, Subject>;
  private assignments: Assignment[];
  private lockedSlots: PlacedSlot[];

  constructor(input: SolverInput) {
    this.versionId = input.versionId;
    this.dayStructures = input.dayStructures;
    this.classrooms = input.classrooms;
    this.subjects = input.subjects;
    this.assignments = input.assignments;
    this.lockedSlots = input.lockedSlots || [];

    this.teachersMap = new Map(input.teachers.map((t) => [t.id, t]));
    this.subjectsMap = new Map(input.subjects.map((s) => [s.id, s]));
  }

  /**
   * Menjalankan generator otomatis jadwal bebas bentrok (CSP Heuristic + Backtracking)
   */
  public solve(): SolverResult {
    const startTime = Date.now();

    // 1. Ekstrak sesi pelajaran (Lesson Sessions) dari SK Penugasan
    const sessions = this.decomposeAssignmentsToSessions();

    // 2. Siapkan matriks penempatan slot
    const placedSlots: PlacedSlot[] = [...this.lockedSlots];

    // Tracker penempatan untuk cek O(1)
    // Teacher: teacherId -> Set of `${day}_${jp}`
    const teacherOccupied = new Map<string, Set<string>>();
    // Class: classroomId -> Set of `${day}_${jp}`
    const classOccupied = new Map<string, Set<string>>();
    // Room: room -> Set of `${day}_${jp}` count
    const roomUsage = new Map<string, Map<string, number>>();
    // Class Days for subject: `${classroomId}_${subjectId}` -> Set of days
    const classSubjectDays = new Map<string, Set<string>>();

    // Inisialisasi tracker dengan locked slots (jika ada)
    for (const slot of this.lockedSlots) {
      const slotKey = `${slot.day}_${slot.jp}`;
      if (slot.teacherId) {
        if (!teacherOccupied.has(slot.teacherId)) teacherOccupied.set(slot.teacherId, new Set());
        teacherOccupied.get(slot.teacherId)!.add(slotKey);
      }
      if (!classOccupied.has(slot.classroomId)) classOccupied.set(slot.classroomId, new Set());
      classOccupied.get(slot.classroomId)!.add(slotKey);

      if (slot.room && slot.room !== "Kelas" && slot.room !== "Reguler") {
        if (!roomUsage.has(slot.room)) roomUsage.set(slot.room, new Map());
        const countMap = roomUsage.get(slot.room)!;
        countMap.set(slotKey, (countMap.get(slotKey) || 0) + 1);
      }

      const csKey = `${slot.classroomId}_${slot.subjectId}`;
      if (!classSubjectDays.has(csKey)) classSubjectDays.set(csKey, new Set());
      classSubjectDays.get(csKey)!.add(slot.day);
    }

    // 3. Urutkan sesi pelajaran berdasar prinsip MRV (Most Constrained Variable First):
    // Prioritas:
    // a. Ruangan terbatas (Lab IPA, Lab Komputer, Lapangan)
    // b. Durasi sesi terbesar (3 JP duluan, lalu 2 JP)
    // c. Guru dengan beban jam terbanyak
    // d. Prioritas jam pagi
    sessions.sort((a, b) => {
      const aSpecialRoom = a.roomType !== "Reguler" ? 1 : 0;
      const bSpecialRoom = b.roomType !== "Reguler" ? 1 : 0;
      if (aSpecialRoom !== bSpecialRoom) return bSpecialRoom - aSpecialRoom;

      if (a.durationJp !== b.durationJp) return b.durationJp - a.durationJp;

      const aMorning = a.isMorningPriority ? 1 : 0;
      const bMorning = b.isMorningPriority ? 1 : 0;
      return bMorning - aMorning;
    });

    // 4. Tempatkan setiap sesi secara heuristik (Greedy Heuristic with Best-Fit Score)
    for (const session of sessions) {
      const bestPlacement = this.findBestPlacementForSession(
        session,
        teacherOccupied,
        classOccupied,
        roomUsage,
        classSubjectDays
      );

      if (bestPlacement) {
        const { day, startJp } = bestPlacement;
        const csKey = `${session.classroomId}_${session.subjectId}`;
        if (!classSubjectDays.has(csKey)) classSubjectDays.set(csKey, new Set());
        classSubjectDays.get(csKey)!.add(day);

        for (let offset = 0; offset < session.durationJp; offset++) {
          const jp = startJp + offset;
          const slotKey = `${day}_${jp}`;

          // Update tracker
          if (!teacherOccupied.has(session.teacherId)) teacherOccupied.set(session.teacherId, new Set());
          teacherOccupied.get(session.teacherId)!.add(slotKey);

          if (!classOccupied.has(session.classroomId)) classOccupied.set(session.classroomId, new Set());
          classOccupied.get(session.classroomId)!.add(slotKey);

          if (session.roomType !== "Reguler") {
            if (!roomUsage.has(session.roomType)) roomUsage.set(session.roomType, new Map());
            const countMap = roomUsage.get(session.roomType)!;
            countMap.set(slotKey, (countMap.get(slotKey) || 0) + 1);
          }

          placedSlots.push({
            id: `SLOT-${this.versionId}-${session.classroomId}-${day.toUpperCase()}-${jp}`,
            versionId: this.versionId,
            classroomId: session.classroomId,
            day,
            jp,
            assignmentId: session.assignmentId,
            teacherId: session.teacherId,
            subjectId: session.subjectId,
            room: session.roomType,
            isLocked: false,
          });
        }
      } else {
        // Fallback: Jika tidak menemukan penempatan kontinu murni, cari slot alternatif
        this.fallbackPlaceSession(
          session,
          placedSlots,
          teacherOccupied,
          classOccupied,
          roomUsage
        );
      }
    }

    // 5. Validasi Bentrok
    const conflicts = ConflictValidator.validate(placedSlots, this.teachersMap, this.dayStructures);

    // 6. Evaluasi Skor Optimasi
    const maxSchoolCapacity = this.classrooms.length * this.dayStructures.reduce((acc, d) => acc + d.maxJp, 0);
    const requestedTargetJp = this.assignments.reduce((acc, a) => acc + a.totalJpPerWeek, 0);
    const effectiveTargetJp = Math.min(requestedTargetJp, maxSchoolCapacity);

    const score = Scorer.calculate(placedSlots, this.subjectsMap, effectiveTargetJp);
    score.hardScore = conflicts.length;

    const executionTimeMs = Date.now() - startTime;

    return {
      success: conflicts.length === 0 && placedSlots.length >= effectiveTargetJp * 0.95,
      versionId: this.versionId,
      slots: placedSlots,
      conflicts,
      score,
      executionTimeMs,
    };
  }

  /**
   * Mengurai penugasan guru (misal total 4 JP dengan sessionSplit [2, 2]) menjadi unit sesi mandiri
   */
  private decomposeAssignmentsToSessions(): LessonSession[] {
    const sessions: LessonSession[] = [];
    let sessionCounter = 1;

    for (const ass of this.assignments) {
      const subject = this.subjectsMap.get(ass.subjectId);
      const roomType = subject?.roomType || "Reguler";
      const isMorningPriority = subject?.isMorningPriority || false;

      const splits = ass.sessionSplit && ass.sessionSplit.length > 0 ? ass.sessionSplit : [ass.totalJpPerWeek];

      for (let i = 0; i < splits.length; i++) {
        const duration = splits[i];
        sessions.push({
          sessionId: `${ass.id}-S${i + 1}-${sessionCounter++}`,
          assignmentId: ass.id,
          teacherId: ass.teacherId,
          classroomId: ass.classroomId,
          subjectId: ass.subjectId,
          durationJp: duration,
          isMorningPriority,
          roomType,
        });
      }
    }

    return sessions;
  }

  /**
   * Menemukan posisi terbaik (Hari & JP Awal) untuk menempatkan blok sesi kontinu
   */
  private findBestPlacementForSession(
    session: LessonSession,
    teacherOccupied: Map<string, Set<string>>,
    classOccupied: Map<string, Set<string>>,
    roomUsage: Map<string, Map<string, number>>,
    classSubjectDays: Map<string, Set<string>>
  ): { day: string; startJp: number } | null {
    const csKey = `${session.classroomId}_${session.subjectId}`;
    const usedDaysForSubject = classSubjectDays.get(csKey) || new Set<string>();

    const teacher = this.teachersMap.get(session.teacherId);
    const unavailableList = teacher?.unavailableSlots || [];

    // Opsi kandidat
    interface Candidate {
      day: string;
      startJp: number;
      score: number;
    }
    const candidates: Candidate[] = [];

    // Prioritas urutan hari (utamakan variasi)
    const dayList = [...this.dayStructures];

    for (const dayStruct of dayList) {
      const day = dayStruct.day;

      // Soft constraint: Hindari menaruh mapel yang sama pada hari yang sama (misal 2+2 MTK di hari yang sama)
      const dayAlreadyUsedForSub = usedDaysForSubject.has(day);

      // Cari slot berurutan sepanjang session.durationJp
      const maxStart = dayStruct.maxJp - session.durationJp + 1;

      for (let startJp = 1; startJp <= maxStart; startJp++) {
        let isFeasible = true;

        for (let offset = 0; offset < session.durationJp; offset++) {
          const currentJp = startJp + offset;
          const slotKey = `${day}_${currentJp}`;

          // 1. Cek Teacher bentrok
          if (teacherOccupied.get(session.teacherId)?.has(slotKey)) {
            isFeasible = false;
            break;
          }

          // 2. Cek Classroom bentrok
          if (classOccupied.get(session.classroomId)?.has(slotKey)) {
            isFeasible = false;
            break;
          }

          // 3. Cek Teacher Unavailable
          if (unavailableList.some((u) => u.day.toLowerCase() === day.toLowerCase() && u.jp === currentJp)) {
            isFeasible = false;
            break;
          }

          // 4. Cek Room limit
          if (session.roomType !== "Reguler") {
            const count = roomUsage.get(session.roomType)?.get(slotKey) || 0;
            const limit = session.roomType === "Lapangan" ? 3 : 2;
            if (count >= limit) {
              isFeasible = false;
              break;
            }
          }
        }

        if (isFeasible) {
          let candidateScore = 100;

          // Penalti besar jika hari sudah dipakai untuk mapel yang sama (prioritas pisah hari untuk 4 JP)
          if (dayAlreadyUsedForSub) {
            candidateScore -= 60;
          }

          // Prioritas jam pagi untuk mapel eksakta
          if (session.isMorningPriority) {
            if (startJp <= 2) candidateScore += 30;
            else if (startJp <= 4) candidateScore += 15;
            else candidateScore -= 20;
          }

          // Jumat sebaiknya durasi <= 4 JP dan startJp <= 2
          if (day === "Jumat" && session.durationJp > 3) {
            candidateScore -= 40;
          }

          candidates.push({ day, startJp, score: candidateScore });
        }
      }
    }

    if (candidates.length === 0) return null;

    // Pilih kandidat dengan skor tertinggi
    candidates.sort((a, b) => b.score - a.score);
    return { day: candidates[0].day, startJp: candidates[0].startJp };
  }

  /**
   * Fallback jika blok kontinu optimal penuh: alokasikan pada slot kosong mana pun yang tidak bentrok
   */
  private fallbackPlaceSession(
    session: LessonSession,
    placedSlots: PlacedSlot[],
    teacherOccupied: Map<string, Set<string>>,
    classOccupied: Map<string, Set<string>>,
    roomUsage: Map<string, Map<string, number>>
  ) {
    let remaining = session.durationJp;

    for (const dayStruct of this.dayStructures) {
      if (remaining <= 0) break;
      const day = dayStruct.day;

      for (let jp = 1; jp <= dayStruct.maxJp; jp++) {
        if (remaining <= 0) break;
        const slotKey = `${day}_${jp}`;

        // Cek room capacity limit
        if (session.roomType !== "Reguler") {
          const count = roomUsage.get(session.roomType)?.get(slotKey) || 0;
          const limit = session.roomType === "Lapangan" ? 3 : 2;
          if (count >= limit) continue;
        }

        if (!teacherOccupied.get(session.teacherId)?.has(slotKey) && !classOccupied.get(session.classroomId)?.has(slotKey)) {
          // Tempatkan 1 JP
          if (!teacherOccupied.has(session.teacherId)) teacherOccupied.set(session.teacherId, new Set());
          teacherOccupied.get(session.teacherId)!.add(slotKey);

          if (!classOccupied.has(session.classroomId)) classOccupied.set(session.classroomId, new Set());
          classOccupied.get(session.classroomId)!.add(slotKey);

          if (session.roomType !== "Reguler") {
            if (!roomUsage.has(session.roomType)) roomUsage.set(session.roomType, new Map());
            const countMap = roomUsage.get(session.roomType)!;
            countMap.set(slotKey, (countMap.get(slotKey) || 0) + 1);
          }

          placedSlots.push({
            id: `SLOT-${this.versionId}-${session.classroomId}-${day.toUpperCase()}-${jp}`,
            versionId: this.versionId,
            classroomId: session.classroomId,
            day,
            jp,
            assignmentId: session.assignmentId,
            teacherId: session.teacherId,
            subjectId: session.subjectId,
            room: session.roomType,
            isLocked: false,
          });

          remaining--;
        }
      }
    }
  }
}
