"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  Calendar,
  Layers,
  Users,
  BookOpen,
  GraduationCap,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  Filter,
  Search,
} from "lucide-react";

interface Stats {
  totalTeachers: number;
  totalClassrooms: number;
  totalSubjects: number;
  totalSlots: number;
  lockedSlots: number;
  filledSlots: number;
}

interface Teacher {
  id: string;
  code: string;
  name: string;
  nip: string | null;
  mainSubject: string | null;
  maxJpPerWeek: number | null;
  maxJpPerDay: number | null;
}

interface Classroom {
  id: string;
  name: string;
  gradeLevel: number;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  targetJpPerWeek: number;
  roomType: string | null;
}

interface ScheduleSlot {
  jp: string;
  periodNum: number;
  timeRange: string;
  isBreak: boolean;
  slotId: string | null;
  name: string;
  code: string;
  teacher: string;
  teacherId: string | null;
  room: string;
  isLocked: boolean;
  conflictFlag: string | null;
}

export default function AdminScheduleCMSPage() {
  const [activeTab, setActiveTab] = useState<"schedule" | "teachers" | "subjects" | "solver">("schedule");
  const [stats, setStats] = useState<Stats | null>(null);
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [classroomsList, setClassroomsList] = useState<Classroom[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);

  // Schedule Tab State
  const [selectedDay, setSelectedDay] = useState("Senin");
  const [selectedClass, setSelectedClass] = useState("7A");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Edit Modal State
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editTeacherId, setEditTeacherId] = useState("");
  const [editRoom, setEditRoom] = useState("Kelas");
  const [editLocked, setEditLocked] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Solver Tab State
  const [isSolving, setIsSolving] = useState(false);
  const [solverResult, setSolverResult] = useState<any>(null);

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  // Show Toast notification
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Master Data & Stats
  const loadMasterData = async () => {
    try {
      const res = await fetch("/api/admin/master-data");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTeachersList(data.teachers);
        setClassroomsList(data.classrooms);
        setSubjectsList(data.subjects);
      }
    } catch (err) {
      console.error("Gagal memuat master data:", err);
    }
  };

  // Load Schedule Grid
  const loadSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const res = await fetch(
        `/api/schedule?viewMode=class&className=${selectedClass}&day=${selectedDay}&versionId=draft-v1`
      );
      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule || []);
      }
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [selectedClass, selectedDay]);

  // Open Edit Slot Modal
  const handleOpenEdit = (slot: ScheduleSlot) => {
    if (slot.isBreak) return;
    setEditingSlot(slot);
    setEditSubjectId(
      subjectsList.find((s) => s.name === slot.name || s.code === slot.code)?.id || ""
    );
    setEditTeacherId(slot.teacherId || "");
    setEditRoom(slot.room || "Kelas");
    setEditLocked(slot.isLocked || false);
  };

  // Save Slot Mutation
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    try {
      const res = await fetch("/api/admin/schedule-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId: selectedClass,
          day: selectedDay,
          jp: editingSlot.periodNum,
          teacherId: editTeacherId || null,
          subjectId: editSubjectId || null,
          room: editRoom,
          isLocked: editLocked,
          versionId: "draft-v1",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`JP ${editingSlot.periodNum} berhasil disimpan.`);
        setEditingSlot(null);
        loadSchedule();
        loadMasterData();
      } else {
        showToast(data.error || "Gagal menyimpan slot.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem.", "error");
    }
  };

  // Toggle Lock Slot
  const handleToggleLock = async (slot: ScheduleSlot) => {
    if (!slot.slotId) {
      showToast("Slot kosong belum terisi di database.", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/schedule-slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.slotId,
          isLocked: !slot.isLocked,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadSchedule();
        loadMasterData();
      }
    } catch (err) {
      showToast("Gagal memperbarui status kunci slot.", "error");
    }
  };

  // Clear Slot
  const handleClearSlot = async (slot: ScheduleSlot) => {
    if (!slot.slotId) return;
    if (!confirm(`Yakin ingin mengosongkan jadwal JP ${slot.periodNum} ini?`)) return;

    try {
      const res = await fetch(`/api/admin/schedule-slots?slotId=${slot.slotId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Slot berhasil dikosongkan.");
        loadSchedule();
        loadMasterData();
      }
    } catch (err) {
      showToast("Gagal mengosongkan slot.", "error");
    }
  };

  // Trigger Solver
  const handleRunSolver = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menjalankan AI Timetable Solver? Slot yang tidak terkunci (Unlocked) akan dihitung ulang secara otomatis."
      )
    ) {
      return;
    }

    try {
      setIsSolving(true);
      const res = await fetch("/api/solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: "draft-v1", saveToDb: true }),
      });
      const data = await res.json();
      setSolverResult(data);
      if (data.success) {
        showToast(
          `Solver berhasil menyusun jadwal dalam ${data.executionTimeMs}ms! Konflik: ${data.conflictsCount}`
        );
        loadSchedule();
        loadMasterData();
      } else {
        showToast("Solver selesai dengan beberapa peringatan/konflik.", "error");
      }
    } catch (err) {
      showToast("Gagal menjalankan solver jadwal.", "error");
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  CMS Kurikulum & Pengelola Jadwal
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Panel Administrator Manajemen Jadwal & Beban Mengajar SMP Negeri 1 Ngawi
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Solver */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunSolver}
              disabled={isSolving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isSolving ? "animate-spin" : ""}`} />
              {isSolving ? "Menyusun Jadwal..." : "Jalankan Auto Solver"}
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-sm transition-all duration-300 ${
              toastMessage.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs font-semibold px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Dashboard Metrics */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" /> Guru
              </span>
              <p className="text-2xl font-black text-white mt-2">{stats.totalTeachers}</p>
              <span className="text-[10px] text-slate-500">55 Tenaga Pendidik</span>
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
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "schedule"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" /> Kelola Slot Jadwal
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "teachers"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Users className="w-4 h-4" /> Data Guru ({teachersList.length})
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "subjects"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Mata Pelajaran ({subjectsList.length})
          </button>
          <button
            onClick={() => setActiveTab("solver")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "solver"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Solver Otomatis
          </button>
        </div>

        {/* TAB 1: KELOLA JADWAL PER KELAS & HARI */}
        {activeTab === "schedule" && (
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

            {/* Schedule Slot Table / Grid */}
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
                              onClick={() => handleToggleLock(item)}
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
                                onClick={() => handleOpenEdit(item)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-all"
                              >
                                Edit
                              </button>
                              {isAssigned && (
                                <button
                                  onClick={() => handleClearSlot(item)}
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
        )}

        {/* TAB 2: DATA GURU */}
        {activeTab === "teachers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari nama guru, NIP, atau kode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Kode</th>
                      <th className="px-4 py-3">Nama Lengkap & Gelar</th>
                      <th className="px-4 py-3">NIP</th>
                      <th className="px-4 py-3">Mata Pelajaran Utama</th>
                      <th className="px-4 py-3">Maks JP / Minggu</th>
                      <th className="px-4 py-3">Maks JP / Hari</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teachersList
                      .filter(
                        (t) =>
                          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.nip && t.nip.includes(searchQuery))
                      )
                      .map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                              {teacher.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">{teacher.name}</td>
                          <td className="px-4 py-3 text-slate-400 font-mono">{teacher.nip || "-"}</td>
                          <td className="px-4 py-3 text-slate-300">
                            {teacher.mainSubject || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-medium">
                            {teacher.maxJpPerWeek || 30} JP
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-medium">
                            {teacher.maxJpPerDay || 6} JP
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATA MATA PELAJARAN */}
        {activeTab === "subjects" && (
          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Kode Mapel</th>
                      <th className="px-4 py-3">Nama Mata Pelajaran</th>
                      <th className="px-4 py-3">Target JP / Minggu</th>
                      <th className="px-4 py-3">Tipe Ruangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {subjectsList.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-mono font-bold text-blue-400">{sub.code}</td>
                        <td className="px-4 py-3 font-semibold text-white">{sub.name}</td>
                        <td className="px-4 py-3 text-slate-300 font-medium">
                          {sub.targetJpPerWeek} JP
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {sub.roomType || "Reguler"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOLVER OTOMATIS & METRIK */}
        {activeTab === "solver" && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Algoritma Pembuat Jadwal Otomatis (Constraint Satisfaction Engine)
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Algoritma solver menghitung ribuan kombinasi slot guru dan rombel kelas untuk mencegah tabrakan jam guru, menjaga batas maksimal JP per hari, memprioritaskan mapel berat di jam pagi, dan menghormati slot yang telah Anda kunci secara manual.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleRunSolver}
                  disabled={isSolving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSolving ? "animate-spin" : ""}`} />
                  {isSolving ? "Memproses Penyusunan..." : "Jalankan Auto Solver Sekarang"}
                </button>
              </div>
            </div>

            {solverResult && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Laporan Hasil Eksekusi Terakhir
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Durasi Komputasi</span>
                    <span className="text-base font-bold text-white font-mono">
                      {solverResult.executionTimeMs} ms
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Total Slot Terjadwal</span>
                    <span className="text-base font-bold text-blue-400 font-mono">
                      {solverResult.totalSlots}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Konflik Tabrakan</span>
                    <span
                      className={`text-base font-bold font-mono ${
                        solverResult.conflictsCount === 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {solverResult.conflictsCount}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Skor Kebugaran (Fitness)</span>
                    <span className="text-base font-bold text-purple-400 font-mono">
                      {solverResult.score ?? 100}%
                    </span>
                  </div>
                </div>

                {solverResult.conflicts && solverResult.conflicts.length > 0 && (
                  <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs space-y-2">
                    <p className="font-semibold text-rose-300">Daftar Konflik Terdeteksi:</p>
                    <ul className="list-disc pl-5 text-rose-400/90 space-y-1">
                      {solverResult.conflicts.map((c: any, i: number) => (
                        <li key={i}>{typeof c === "string" ? c : JSON.stringify(c)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL EDIT SLOT */}
        {editingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Edit Slot Pembelajaran</h3>
                  <p className="text-xs text-slate-400">
                    Kelas {selectedClass} • {selectedDay} • {editingSlot.jp} ({editingSlot.timeRange})
                  </p>
                </div>
                <button
                  onClick={() => setEditingSlot(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSlot} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Mata Pelajaran</label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="">-- Kosong / Mandiri --</option>
                    {subjectsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.code}] {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Guru Pengampu</label>
                  <select
                    value={editTeacherId}
                    onChange={(e) => setEditTeacherId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachersList.map((t) => (
                      <option key={t.id} value={t.id}>
                        ({t.code}) {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Ruangan</label>
                  <select
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="Kelas">Kelas Reguler</option>
                    <option value="Lab Komputer">Lab Komputer</option>
                    <option value="Lab IPA">Lab IPA</option>
                    <option value="Lapangan Olahraga">Lapangan Olahraga</option>
                    <option value="Ruang Seni / Musik">Ruang Seni / Musik</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editLocked}
                      onChange={(e) => setEditLocked(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300 font-medium">
                      Kunci Slot Ini (Jangan diubah oleh solver otomatis)
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
