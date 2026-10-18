"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Search, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  ChevronRight,
  Layers,
  Printer,
  ChevronDown,
  RefreshCw
} from "lucide-react";

interface ScheduleItem {
  jp: string;
  timeRange: string;
  isBreak: boolean;
  name: string;
  code: string;
  teacher: string;
  room: string;
}

interface TeacherOption {
  id: string;
  code: string;
  name: string;
  mainSubject: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"kelas" | "guru">("kelas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<"ALL" | "7" | "8" | "9">("ALL");

  // Selected for quick preview modal/drawer
  const [selectedEntityName, setSelectedEntityName] = useState<string>("7A");
  const [selectedDay, setSelectedDay] = useState("Senin");
  const [liveSchedule, setLiveSchedule] = useState<ScheduleItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [teachersList, setTeachersList] = useState<TeacherOption[]>([]);

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  // 30 Rombel riil SMPN 1 Ngawi
  const all30Classes = [
    { name: "7A", grade: "7", students: 32 },
    { name: "7B", grade: "7", students: 32 },
    { name: "7C", grade: "7", students: 32 },
    { name: "7D", grade: "7", students: 32 },
    { name: "7E", grade: "7", students: 32 },
    { name: "7F", grade: "7", students: 32 },
    { name: "7G", grade: "7", students: 32 },
    { name: "7H", grade: "7", students: 32 },
    { name: "7I", grade: "7", students: 32 },
    { name: "7J", grade: "7", students: 32 },
    { name: "8A", grade: "8", students: 32 },
    { name: "8B", grade: "8", students: 32 },
    { name: "8C", grade: "8", students: 32 },
    { name: "8D", grade: "8", students: 32 },
    { name: "8E", grade: "8", students: 32 },
    { name: "8F", grade: "8", students: 32 },
    { name: "8G", grade: "8", students: 32 },
    { name: "8H", grade: "8", students: 32 },
    { name: "8I", grade: "8", students: 32 },
    { name: "8J", grade: "8", students: 32 },
    { name: "9A", grade: "9", students: 32 },
    { name: "9B", grade: "9", students: 32 },
    { name: "9C", grade: "9", students: 32 },
    { name: "9D", grade: "9", students: 32 },
    { name: "9E", grade: "9", students: 32 },
    { name: "9F", grade: "9", students: 32 },
    { name: "9G", grade: "9", students: 32 },
    { name: "9H", grade: "9", students: 32 },
    { name: "9I", grade: "9", students: 32 },
    { name: "9J", grade: "9", students: 32 },
  ];

  useEffect(() => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.teachers) {
          setTeachersList(data.teachers);
        }
      });
  }, []);

  // Fetch jadwal langsung untuk quick-view
  const loadQuickSchedule = async (entity: string, day: string, type: "kelas" | "guru") => {
    try {
      setLoadingSchedule(true);
      const url =
        type === "kelas"
          ? `/api/schedule?viewMode=class&className=${entity}&day=${day}&versionId=draft-v1`
          : `/api/schedule?viewMode=teacher&teacherId=${entity}&day=${day}&versionId=draft-v1`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.schedule) {
        setLiveSchedule(data.schedule);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    loadQuickSchedule(selectedEntityName, selectedDay, activeTab);
  }, [selectedEntityName, selectedDay, activeTab]);

  const filteredClasses = all30Classes.filter((c) => {
    const matchesGrade = selectedGrade === "ALL" || c.grade === selectedGrade;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const filteredTeachers = teachersList.filter((t) => {
    return (
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mainSubject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden p-6 sm:p-12 glass-panel border border-slate-800/80">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glow-badge-blue text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Jadwal Sekolah Terintegrasi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Jadwal Pembelajaran Pintar{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                SMP Negeri 1 Ngawi
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              Akses cepat dan ringan tanpa perlu login untuk seluruh siswa, wali murid, dan tenaga pendidik. Teroptimasi penuh untuk perangkat smartphone.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/matrix"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30"
              >
                <Layers className="w-4 h-4" />
                <span>Matriks Interaktif</span>
              </Link>
              <Link
                href="/export"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen & Excel</span>
              </Link>
              <Link
                href="/graphql-docs"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl glass-panel-subtle hover:bg-slate-800 text-slate-200 font-medium text-xs sm:text-sm transition-all"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>GraphQL API</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="glass-panel-subtle p-3.5 sm:p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">30</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Rombel (7A–9J)</div>
            </div>
            <div className="glass-panel-subtle p-3.5 sm:p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">55</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Tenaga Pendidik</div>
            </div>
            <div className="glass-panel-subtle p-3.5 sm:p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">40m / 30m</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">JP Dinamis</div>
            </div>
            <div className="glass-panel-subtle p-3.5 sm:p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">0</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Zero Conflict</div>
            </div>
          </div>
        </section>

        {/* Live Quick-View Timetable Viewer */}
        <section className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Jadwal Belajar Hari {selectedDay} — {activeTab === "kelas" ? `Kelas ${selectedEntityName}` : `Guru ${selectedEntityName}`}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Jadwal harian aktif yang tersinkronisasi otomatis dengan database sekolah.
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDay === day
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Feed Grid (Mobile-First Card Layout) */}
          <div className="space-y-2.5">
            {loadingSchedule ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-400 mb-2" />
                Memuat jadwal live...
              </div>
            ) : liveSchedule.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Tidak ada jam pelajaran aktif pada hari {selectedDay}.
              </div>
            ) : (
              liveSchedule.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    item.isBreak
                      ? "bg-amber-500/5 border-amber-500/20 text-amber-300"
                      : "glass-panel-subtle border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        item.isBreak
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-blue-600/15 text-blue-300 border border-blue-500/20"
                      }`}
                    >
                      <span>{item.jp}</span>
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {!item.isBreak && item.code !== "-" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800/40">
                            {item.code}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{item.timeRange}</span>
                        {!item.isBreak && item.teacher !== "-" && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300">{item.teacher}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!item.isBreak && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {item.room}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Directory Search & Filter (Tabs: Rombel Kelas vs Guru) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
              <button
                onClick={() => {
                  setActiveTab("kelas");
                  setSelectedEntityName("7A");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "kelas"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>30 Rombel Kelas</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("guru");
                  setSelectedEntityName(teachersList[0]?.id || "T01");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "guru"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>55 Tenaga Pendidik</span>
              </button>
            </div>

            {/* Grade Filter (Only active on kelas tab) */}
            {activeTab === "kelas" && (
              <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel-subtle border border-slate-800">
                {(["ALL", "7", "8", "9"] as const).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedGrade === grade
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {grade === "ALL" ? "Semua" : `Kelas ${grade}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === "kelas"
                  ? "Cari rombel (misal: 7A, 8B, 9J)..."
                  : "Cari nama guru, inisial kode (misal: ST, WS), atau mapel..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-panel-subtle border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Directory Grid Cards */}
          {activeTab === "kelas" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredClasses.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setSelectedEntityName(item.name);
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedEntityName === item.name
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-blue-500"
                      : "glass-panel glass-card-hover border-slate-800"
                  }`}
                >
                  <div className="text-lg font-black">{item.name}</div>
                  <div className={`text-[11px] mt-1 ${selectedEntityName === item.name ? "text-blue-100" : "text-slate-400"}`}>
                    Jenjang {item.grade} • 32 Siswa
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
                    <span>Lihat Jadwal</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTeachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedEntityName(t.id);
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedEntityName === t.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-blue-500"
                      : "glass-panel glass-card-hover border-slate-800 text-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm">{t.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        selectedEntityName === t.id ? "bg-white/20 text-white" : "bg-blue-900/40 text-blue-300"
                      }`}>
                        {t.code}
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${selectedEntityName === t.id ? "text-blue-100" : "text-slate-400"}`}>
                      Pengampu Mapel {t.mainSubject}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
