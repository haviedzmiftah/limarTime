import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Stats } from "@/types/admin";

interface AdminMetricsBarProps {
  stats: Stats;
}

export function AdminMetricsBar({ stats }: AdminMetricsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-400" /> Guru
        </span>
        <p className="text-2xl font-black text-white mt-2">{stats.totalTeachers}</p>
        <span className="text-[10px] text-slate-500">55 Pengajar</span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-emerald-400" /> Rombel
        </span>
        <p className="text-2xl font-black text-white mt-2">{stats.totalClassrooms}</p>
        <span className="text-[10px] text-slate-500">Kelas 7A - 9J</span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber-400" /> Mapel
        </span>
        <p className="text-2xl font-black text-white mt-2">{stats.totalSubjects}</p>
        <span className="text-[10px] text-slate-500">Kurikulum Nasional</span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-sky-400" /> Total Slot
        </span>
        <p className="text-2xl font-black text-white mt-2">{stats.totalSlots}</p>
        <span className="text-[10px] text-slate-500">Slot Tergenerate</span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-purple-400" /> Slot Terkunci
        </span>
        <p className="text-2xl font-black text-purple-300 mt-2">{stats.lockedSlots}</p>
        <span className="text-[10px] text-slate-500">Proteksi Solver</span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-400" /> Slot Terisi
        </span>
        <p className="text-2xl font-black text-teal-300 mt-2">{stats.filledSlots}</p>
        <span className="text-[10px] text-slate-500">Terjadwal Aktif</span>
      </div>
    </div>
  );
}
