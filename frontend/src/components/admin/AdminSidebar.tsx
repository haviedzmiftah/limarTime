import Link from "next/link";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  BookOpen,
  Sparkles,
  ExternalLink,
  Layers,
  ShieldCheck,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (v: boolean) => void;
  activeTab: "schedule" | "teachers" | "subjects" | "bell" | "solver";
  setActiveTab: (tab: "schedule" | "teachers" | "subjects" | "bell" | "solver") => void;
  teachersCount: number;
  subjectsCount: number;
  onLogout: () => void;
}

export function AdminSidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  activeTab,
  setActiveTab,
  teachersCount,
  subjectsCount,
  onLogout,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900/95 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } ${
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Header & Logo */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Clock className="w-5 h-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white">
                      limarTime
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      CMS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">SMPN 1 Ngawi</p>
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isSidebarCollapsed ? "Perluas Menu" : "Kecilkan Menu"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {!isSidebarCollapsed ? "Menu Utama" : "•"}
            </div>

            <button
              onClick={() => {
                setActiveTab("schedule");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "schedule"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="Kelola Slot Jadwal"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Kelola Jadwal</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("teachers");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "teachers"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="Data Guru"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Data Guru</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {teachersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("subjects");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "subjects"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="Mata Pelajaran"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Mata Pelajaran</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {subjectsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("bell");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "bell"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="Hari & Jam Belajar"
            >
              <Clock className="w-4 h-4 shrink-0 text-sky-400" />
              {!isSidebarCollapsed && <span>Hari & Jam Belajar</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("solver");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "solver"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="AI Timetable Solver"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              {!isSidebarCollapsed && <span>Solver Otomatis</span>}
            </button>
          </div>

          {/* Quick External Links */}
          <div className="p-3 pt-4 border-t border-slate-800/80 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {!isSidebarCollapsed ? "Portal Publik" : "•"}
            </div>

            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              title="Lihat Portal Publik"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Halaman Depan</span>}
            </Link>

            <Link
              href="/matrix"
              target="_blank"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              title="Matriks Jadwal"
            >
              <Layers className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Matriks Rombel</span>}
            </Link>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">Administrator</p>
                  <p className="text-[10px] text-slate-400 truncate">Kurikulum</p>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              title="Keluar / Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
