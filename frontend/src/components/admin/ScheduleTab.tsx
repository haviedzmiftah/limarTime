import { Calendar, RefreshCw, Lock, Unlock, Edit3, Trash2 } from "lucide-react";
import { Classroom, ScheduleSlot } from "@/types/admin";

interface ScheduleTabProps {
  days: string[];
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  classroomsList: Classroom[];
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  loadSchedule: () => void;
  loadingSchedule: boolean;
  schedule: ScheduleSlot[];
  onToggleLock: (slot: ScheduleSlot) => void;
  onOpenEdit: (slot: ScheduleSlot) => void;
  onClearSlot: (slot: ScheduleSlot) => void;
}

export function ScheduleTab({
  days,
  selectedDay,
  setSelectedDay,
  classroomsList,
  selectedClass,
  setSelectedClass,
  loadSchedule,
  loadingSchedule,
  schedule,
  onToggleLock,
  onOpenEdit,
  onClearSlot,
}: ScheduleTabProps) {
  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              PILIH HARI
            </label>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedDay === day
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              PILIH KELAS
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-blue-500"
            >
              {classroomsList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Kelas {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSchedule}
            disabled={loadingSchedule}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSchedule ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Schedule Slot Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Jadwal Pembelajaran: Kelas {selectedClass} • Hari {selectedDay}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik Edit untuk mengubah guru pengampu, mapel, atau kunci slot agar aman saat auto-solver dijalankan.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Jam Ke</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Mata Pelajaran</th>
                <th className="px-4 py-3">Guru Pengampu</th>
                <th className="px-4 py-3">Ruang</th>
                <th className="px-4 py-3 text-center">Status Kunci</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {schedule.map((item, idx) => {
                if (item.isBreak) {
                  return (
                    <tr key={idx} className="bg-slate-950/40 text-slate-500">
                      <td className="px-4 py-3 font-semibold text-slate-400">{item.jp}</td>
                      <td className="px-4 py-3 text-slate-400">{item.timeRange}</td>
                      <td colSpan={5} className="px-4 py-3 italic font-medium text-slate-400">
                        ☕ {item.name}
                      </td>
                    </tr>
                  );
                }

                const isAssigned = item.code && item.code !== "-";

                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-4 py-3.5 font-bold text-blue-400">{item.jp}</td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {item.timeRange}
                    </td>
                    <td className="px-4 py-3.5">
                      {isAssigned ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 font-mono border border-blue-800/40">
                            {item.code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Jam Kosong / Belum Diisi</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {item.teacher !== "-" ? (
                        <span className="font-medium text-slate-200">{item.teacher}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {item.room || "Kelas"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => onToggleLock(item)}
                        disabled={!item.slotId}
                        title={item.isLocked ? "Buka Kunci" : "Kunci Slot"}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.isLocked
                            ? "bg-purple-950/80 border-purple-500/40 text-purple-400 hover:bg-purple-900"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
                        } disabled:opacity-30`}
                      >
                        {item.isLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEdit(item)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-all"
                        >
                          Edit
                        </button>
                        {isAssigned && (
                          <button
                            onClick={() => onClearSlot(item)}
                            className="p-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/30 border border-rose-500/20 text-rose-400 transition-all"
                            title="Kosongkan JP Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
