import { Clock, Plus, Edit3, Trash2, Coffee, BookOpen, RefreshCw } from "lucide-react";
import { BellSchedule } from "@/types/admin";
import { Button } from "@/components/ui";

interface BellTabProps {
  days: string[];
  selectedBellDay: string;
  setSelectedBellDay: (day: string) => void;
  bellSchedulesList: BellSchedule[];
  loadingBell: boolean;
  onRefresh: () => void;
  onOpenAddBell: () => void;
  onOpenEditBell: (bell: BellSchedule) => void;
  onConfirmDelete: (bell: BellSchedule) => void;
}

export function BellTab({
  days,
  selectedBellDay,
  setSelectedBellDay,
  bellSchedulesList,
  loadingBell,
  onRefresh,
  onOpenAddBell,
  onOpenEditBell,
  onConfirmDelete,
}: BellTabProps) {
  return (
    <div className="space-y-6">
      {/* Filter Hari & Aksi Tambah */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            PILIH HARI
          </label>
          <div className="flex flex-wrap rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedBellDay(day)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedBellDay === day
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onRefresh}
            variant="secondary"
            size="sm"
            isLoading={loadingBell}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            onClick={onOpenAddBell}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tambah Jam Belajar
          </Button>
        </div>
      </div>

      {/* Tabel Struktur Jam Pelajaran & Istirahat */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Struktur Jam Pelajaran & Istirahat: Hari {selectedBellDay}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Atur urutan jam (JP), rentang waktu mulai - selesai, durasi menit, serta penanda istirahat/upacara/MBG.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">JP Ke</th>
                <th className="px-4 py-3">Rentang Waktu</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bellSchedulesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Belum ada struktur jam untuk hari {selectedBellDay}. Klik "Tambah Jam Belajar" untuk membuat baru.
                  </td>
                </tr>
              ) : (
                bellSchedulesList.map((bell) => (
                  <tr
                    key={bell.id}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      bell.isBreak ? "bg-slate-950/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-blue-400">
                      {bell.jp === 0 ? "JP 0" : `JP ${bell.jp}`}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-200">
                      {bell.timeRange}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {bell.durationMinutes} Menit
                    </td>
                    <td className="px-4 py-3">
                      {bell.isBreak ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Coffee className="w-3 h-3" />
                          Non-KBM / Istirahat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          <BookOpen className="w-3 h-3" />
                          Jam Belajar KBM
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">
                      {bell.isBreak ? bell.breakName || "Istirahat" : "Pembelajaran Kelas"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditBell(bell)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => onConfirmDelete(bell)}
                          className="p-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/30 border border-rose-500/20 text-rose-400 transition-all"
                          title="Hapus Jam Belajar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
