import { PlacedSlot, OptimizationScore, Subject } from "./types";

export class Scorer {
  /**
   * Menghitung skor optimasi soft-constraints (0 - 100)
   */
  public static calculate(
    slots: PlacedSlot[],
    subjectsMap: Map<string, Subject>,
    totalTargetJp: number
  ): OptimizationScore {
    let score = 100;
    const totalAssigned = slots.length;

    // 1. Evaluasi Prioritas Jam Pagi (Eksakta: MTK, IPA di JP 1-4)
    let morningPriorityTotal = 0;
    let morningPriorityFulfilled = 0;

    for (const slot of slots) {
      const sub = subjectsMap.get(slot.subjectId);
      if (sub && sub.isMorningPriority) {
        morningPriorityTotal++;
        if (slot.jp <= 4) {
          morningPriorityFulfilled++;
        }
      }
    }

    if (morningPriorityTotal > 0) {
      const morningRatio = morningPriorityFulfilled / morningPriorityTotal;
      // Penalti jika proporsi jam pagi rendah
      const morningBonus = Math.round(morningRatio * 20); // max 20 poin
      score = score - (20 - morningBonus);
    }

    // 2. Evaluasi Jeda Kosong Guru (Teacher Gaps / Jam Kosong Antara Mengajar)
    const teacherDayJps = new Map<string, number[]>();
    for (const slot of slots) {
      if (!slot.teacherId) continue;
      const key = `${slot.teacherId}__${slot.day}`;
      const list = teacherDayJps.get(key) || [];
      list.push(slot.jp);
      teacherDayJps.set(key, list);
    }

    let totalGaps = 0;
    for (const jps of teacherDayJps.values()) {
      if (jps.length <= 1) continue;
      jps.sort((a, b) => a - b);
      for (let i = 0; i < jps.length - 1; i++) {
        const gap = jps[i + 1] - jps[i] - 1;
        if (gap > 0) {
          totalGaps += gap;
        }
      }
    }

    // Tiap 10 jam jeda kurangi 1 poin soft score (maksimal penalti 15)
    const gapPenalty = Math.min(15, Math.floor(totalGaps / 10));
    score -= gapPenalty;

    // 3. Evaluasi Kesesuaian Target JP
    const completionRatio = totalTargetJp > 0 ? totalAssigned / totalTargetJp : 1;
    if (completionRatio < 1) {
      score -= Math.round((1 - completionRatio) * 40);
    }

    const finalSoftScore = Math.max(0, Math.min(100, score));

    return {
      hardScore: 0, // Akan di-override jika ada hard conflict
      softScore: finalSoftScore,
      totalAssignedJp: totalAssigned,
      totalTargetJp,
      metrics: {
        morningPriorityFulfilled,
        morningPriorityTotal,
        teacherGapsCount: totalGaps,
        splitSpreadFulfilled: totalAssigned,
      },
    };
  }
}
