import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mengambil menit mulai dari format string rentang waktu seperti:
 * "07.00 - 07.40", "08.00 - 08.40", "07.00 - 08.00 (JP 0)", "07:00 - 07:40"
 * Mengembalikan total menit sejak 00:00 untuk perbandingan urutan kronologis.
 */
export function parseStartTime(timeRange?: string | null): number {
  if (!timeRange) return 9999;
  const match = timeRange.match(/(\d{1,2})[.:](\d{2})/);
  if (!match) return 9999;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Mengurutkan array jadwal bel atau slot jadwal berdasarkan waktu pagi ke siang secara kronologis.
 */
export function sortByStartTime<T extends { timeRange?: string | null; jp?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const timeA = parseStartTime(a.timeRange);
    const timeB = parseStartTime(b.timeRange);
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    // Jika waktu sama, urutkan berdasarkan JP
    return (a.jp ?? 0) - (b.jp ?? 0);
  });
}

