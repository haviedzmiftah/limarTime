import { PlacedSlot, ConflictReport, TeacherConstraint, DayStructure } from "./types";

export class ConflictValidator {
  /**
   * Memvalidasi seluruh slot jadwal terhadap Hard Constraints
   */
  public static validate(
    slots: PlacedSlot[],
    teachers: Map<string, TeacherConstraint>,
    dayStructures: DayStructure[]
  ): ConflictReport[] {
    const conflicts: ConflictReport[] = [];

    // 1. Cek Teacher Conflict: 1 Guru tidak boleh mengajar di 2 rombel pada (day, jp) yang sama
    const teacherSlotMap = new Map<string, PlacedSlot[]>();
    for (const slot of slots) {
      if (!slot.teacherId) continue;
      const key = `${slot.teacherId}__${slot.day}__${slot.jp}`;
      const group = teacherSlotMap.get(key) || [];
      group.push(slot);
      teacherSlotMap.set(key, group);
    }

    for (const [key, group] of teacherSlotMap.entries()) {
      if (group.length > 1) {
        const [teacherId, day, jpStr] = key.split("__");
        const teacher = teachers.get(teacherId);
        const jp = parseInt(jpStr, 10);
        conflicts.push({
          type: "TEACHER_DOUBLE_BOOKING",
          message: `Bentrok Guru: ${teacher?.name || teacherId} dijadwalkan di ${group.length} rombel (${group.map((g) => g.classroomId).join(", ")}) pada ${day} JP ${jp}.`,
          day,
          jp,
          entityId: teacherId,
          conflictingSlots: group,
        });
      }
    }

    // 2. Cek Classroom Conflict: 1 Kelas tidak boleh belajar 2 mapel pada (day, jp) yang sama
    const classSlotMap = new Map<string, PlacedSlot[]>();
    for (const slot of slots) {
      const key = `${slot.classroomId}__${slot.day}__${slot.jp}`;
      const group = classSlotMap.get(key) || [];
      group.push(slot);
      classSlotMap.set(key, group);
    }

    for (const [key, group] of classSlotMap.entries()) {
      if (group.length > 1) {
        const [classroomId, day, jpStr] = key.split("__");
        const jp = parseInt(jpStr, 10);
        conflicts.push({
          type: "CLASSROOM_DOUBLE_BOOKING",
          message: `Bentrok Rombel: Kelas ${classroomId} menerima ${group.length} kegiatan belajar pada ${day} JP ${jp}.`,
          day,
          jp,
          entityId: classroomId,
          conflictingSlots: group,
        });
      }
    }

    // 3. Cek Teacher Availability / Off-Days
    for (const slot of slots) {
      if (!slot.teacherId) continue;
      const teacher = teachers.get(slot.teacherId);
      if (!teacher || !teacher.unavailableSlots || teacher.unavailableSlots.length === 0) continue;

      const isUnavailable = teacher.unavailableSlots.some(
        (u) => u.day.toLowerCase() === slot.day.toLowerCase() && u.jp === slot.jp
      );

      if (isUnavailable) {
        conflicts.push({
          type: "UNAVAILABLE_SLOT",
          message: `Jadwal Berhalangan: ${teacher.name} memiliki jadwal berhalangan tetap pada ${slot.day} JP ${slot.jp}.`,
          day: slot.day,
          jp: slot.jp,
          entityId: slot.teacherId,
          conflictingSlots: [slot],
        });
      }
    }

    // 4. Cek Room Capacity (Fasilitas Khusus: Lab Komputer, Lab IPA, Lapangan)
    // Asumsi default: Lab Komputer maks 2 rombel bersamaan, Lab IPA maks 2 rombel, Lapangan maks 3 rombel
    const roomLimits: Record<string, number> = {
      Lab_Komputer: 2,
      Lab_IPA: 2,
      Lapangan: 3,
    };

    const roomSlotMap = new Map<string, PlacedSlot[]>();
    for (const slot of slots) {
      if (!slot.room || slot.room === "Kelas" || slot.room === "Reguler") continue;
      const key = `${slot.room}__${slot.day}__${slot.jp}`;
      const group = roomSlotMap.get(key) || [];
      group.push(slot);
      roomSlotMap.set(key, group);
    }

    for (const [key, group] of roomSlotMap.entries()) {
      const [room, day, jpStr] = key.split("__");
      const limit = roomLimits[room] || 1;
      if (group.length > limit) {
        const jp = parseInt(jpStr, 10);
        conflicts.push({
          type: "ROOM_OVER_CAPACITY",
          message: `Kapasitas Ruang Terlampaui: ${room} digunakan oleh ${group.length} kelas sekaligus pada ${day} JP ${jp} (Maksimal ${limit}).`,
          day,
          jp,
          entityId: room,
          conflictingSlots: group,
        });
      }
    }

    return conflicts;
  }
}
