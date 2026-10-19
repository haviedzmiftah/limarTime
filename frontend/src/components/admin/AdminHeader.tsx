import { Menu, Sparkles } from "lucide-react";

interface AdminHeaderProps {
  activeTab: "schedule" | "teachers" | "subjects" | "bell" | "solver";
  onOpenMobileSidebar: () => void;
  onRunSolver: () => void;
  isSolving: boolean;
}

export function AdminHeader({
  activeTab,
  onOpenMobileSidebar,
  onRunSolver,
  isSolving,
}: AdminHeaderProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case "schedule":
        return "Kelola Slot Jadwal";
      case "teachers":
        return "Manajemen Data Guru";
      case "subjects":
        return "Data Mata Pelajaran";
      case "bell":
        return "Struktur Hari & Jam Belajar";
      case "solver":
        return "AI Timetable Auto-Solver";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            {getTabTitle()}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Tahun Ajaran 2026/2027 • Semester Ganjil
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRunSolver}
          disabled={isSolving}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isSolving ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">
            {isSolving ? "Menyusun..." : "Jalankan Auto Solver"}
          </span>
        </button>

        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Aktif
        </span>
      </div>
    </header>
  );
}
