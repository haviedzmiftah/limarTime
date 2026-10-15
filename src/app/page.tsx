"use client";

import { useState } from "react";
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
  Shield,
  Layers
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"kelas" | "guru">("kelas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<"ALL" | "7" | "8" | "9">("ALL");

  // Sample quick data derived from SMPN 1 Ngawi specs
  const classList = [
    { name: "7A", grade: "7", wali: "Sri Lestari, S.Pd (ST)", students: 32 },
    { name: "7B", grade: "7", wali: "Wahyudi, S.Pd (WS)", students: 32 },
    { name: "7C", grade: "7", wali: "Agus Budiman, M.Pd (AB)", students: 32 },
    { name: "7D", grade: "7", wali: "Rina Tri, S.Pd (RT)", students: 32 },
    { name: "8A", grade: "8", wali: "Taufik O., S.Kom (TO)", students: 32 },
    { name: "8B", grade: "8", wali: "Rahmat Y., M.Pd (RY)", students: 32 },
    { name: "8C", grade: "8", wali: "Fajar J., S.Pd (FJ)", students: 32 },
    { name: "9A", grade: "9", wali: "Bambang S., S.Pd (BS)", students: 32 },
    { name: "9B", grade: "9", wali: "Dewi K., M.Pd (DK)", students: 32 },
    { name: "9C", grade: "9", wali: "Hendra P., S.Pd (HP)", students: 32 },
  ];

  const filteredClasses = classList.filter((c) => {
    const matchesGrade = selectedGrade === "ALL" || c.grade === selectedGrade;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.wali.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 glass-panel border border-slate-800/80">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glow-badge-blue text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Penjadwalan Cerdas Generasi Baru</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Akses Jadwal Belajar Mengajar{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                SMP Negeri 1 Ngawi
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Portal pencarian jadwal harian dan mingguan resmi untuk 30 Rombel (7A–9J) dan 55 Tenaga Pendidik. Cepat, interaktif, dan terintegrasi penuh dengan GraphQL API.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/matrix"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
              >
                <Layers className="w-4 h-4" />
                <span>Lihat Matriks Jadwal Induk</span>
              </Link>
              <Link
                href="/graphql-docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel-subtle hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all hover:scale-[1.02]"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>Dokumentasi GraphQL</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/80">
            <div className="glass-panel-subtle p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">30</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Rombongan Belajar (7A–9J)</div>
            </div>
            <div className="glass-panel-subtle p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">55</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Tenaga Pendidik Terdaftar</div>
            </div>
            <div className="glass-panel-subtle p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">40 / 30m</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Durasi JP Dinamis</div>
            </div>
            <div className="glass-panel-subtle p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">0</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Bentrok Jadwal (Zero-Conflict)</div>
            </div>
          </div>
        </section>

        {/* Public Timetable Finder Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                <span>Portal Jadwal Siswa & Guru</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Pilih rombongan belajar kelas atau cari berdasarkan inisial/nama guru tanpa harus login
              </p>
            </div>

            {/* Filter Grade Buttons */}
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
                  {grade === "ALL" ? "Semua Jenjang" : `Kelas ${grade}`}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama rombel (misal: 7A, 8B) atau nama wali kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-panel-subtle border border-slate-800/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Class Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((item) => (
              <div
                key={item.name}
                className="glass-panel glass-card-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      Kelas {item.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full glow-badge-blue">
                      Jenjang {item.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Wali Kelas: <span className="text-slate-200">{item.wali}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kapasitas: {item.students} Siswa
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-blue-400 flex items-center gap-1 font-medium group-hover:underline">
                    Buka Jadwal Kelas <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Capabilities Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Struktur Bell Schedule Fleksibel</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dukungan pergantian durasi JP otomatis (40 menit standar vs 30 menit edisi Jumat/Ramadhan) dengan sinkronisasi jam istirahat, MBG, dan ibadah.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">GraphQL API untuk Web Eksternal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dilengkapi endpoint GraphQL siap konsumsi untuk menampilkan jadwal pelajaran di website profil sekolah atau layar TV display koridor.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Drizzle ORM & Database Fleksibel</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arsitektur database strongly-typed berbasis Drizzle ORM yang kompatibel penuh dengan MySQL maupun PostgreSQL tanpa kompromi performa.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
