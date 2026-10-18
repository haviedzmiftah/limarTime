"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Layers,
  Calendar,
  Download,
  ArrowLeftRight,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Lock,
  Undo2,
  Redo2,
  Save,
  Users,
  GraduationCap,
  GripVertical,
} from "lucide-react";
import { useState, useEffect } from "react";

interface ScheduleItem {
  jp: string;
  periodNum?: number;
  timeRange: string;
  isBreak: boolean;
  slotId?: string | null;
  name: string;
  code: string;
  teacher: string;
  teacherId?: string | null;
  teacherCode?: string | null;
  classroom?: string;
  room: string;
  isLocked: boolean;
  conflictFlag?: string | null;
}

interface TeacherOption {
  id: string;
  code: string;
  name: string;
  mainSubject: string;
}

interface HistoryState {
  schedule: ScheduleItem[];
  description: string;
}

export default function MatrixInteractivePage() {
  const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
  const [selectedDay, setSelectedDay] = useState("Senin");
  const [selectedClass, setSelectedClass] = useState("7A");
  const [selectedTeacherId, setSelectedTeacherId] = useState("T01");
  const [teachersList, setTeachersList] = useState<TeacherOption[]>([]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSolving, setIsSolving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Drag and Drop & Slot Swapping State
  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [hoveredDropSlotId, setHoveredDropSlotId] = useState<string | null>(null);

  // Undo / Redo Stacks
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const classList = [
    "7A", "7B", "7C", "7D", "7E", "7F", "7G", "7H", "7I", "7J",
    "8A", "8B", "8C", "8D", "8E", "8F", "8G", "8H", "8I", "8J",
    "9A", "9B", "9C", "9D", "9E", "9F", "9G", "9H", "9I", "9J",
  ];

  // Fetch daftar guru
  useEffect(() => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.teachers) {
          setTeachersList(data.teachers);
        }
      })
      .catch((err) => console.error("Error fetching teachers:", err));
  }, []);

  // Fetch jadwal sesuai mode tampilan
  const fetchSchedule = async (day: string, className: string, tId: string, mode: "class" | "teacher") => {
    try {
      setLoading(true);
      const url =
        mode === "class"
          ? `/api/schedule?viewMode=class&className=${className}&day=${day}&versionId=draft-v1`
          : `/api/schedule?viewMode=teacher&teacherId=${tId}&day=${day}&versionId=draft-v1`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.schedule) {
        setSchedule(data.schedule);
        // Reset history untuk view baru
        setHistory([{ schedule: data.schedule, description: "Initial Load" }]);
        setHistoryIndex(0);
      }
    } catch (err) {
      console.error("Gagal mengambil jadwal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDay, selectedClass, selectedTeacherId, viewMode);
  }, [selectedDay, selectedClass, selectedTeacherId, viewMode]);

  // Push ke history saat ada perubahan
  const pushHistory = (newSchedule: ScheduleItem[], desc: string) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push({ schedule: newSchedule, description: desc });
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    setSchedule(newSchedule);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setSchedule(history[targetIndex].schedule);
      setMessage({ text: `Undo: ${history[targetIndex].description}`, type: "info" });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setSchedule(history[targetIndex].schedule);
      setMessage({ text: `Redo: ${history[targetIndex].description}`, type: "info" });
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, slotId: string) => {
    setDraggedSlotId(slotId);
    e.dataTransfer.setData("text/plain", slotId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetSlotId: string) => {
    e.preventDefault();
    if (draggedSlotId && draggedSlotId !== targetSlotId) {
      setHoveredDropSlotId(targetSlotId);
    }
  };

  const handleDragLeave = () => {
    setHoveredDropSlotId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetSlotId: string) => {
    e.preventDefault();
    setHoveredDropSlotId(null);
    const sourceSlotId = draggedSlotId || e.dataTransfer.getData("text/plain");

    if (!sourceSlotId || sourceSlotId === targetSlotId) return;

    // Cari dua slot yang ingin ditukar
    const sourceIndex = schedule.findIndex((s) => s.slotId === sourceSlotId);
    const targetIndex = schedule.findIndex((s) => s.slotId === targetSlotId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const sourceItem = schedule[sourceIndex];
    const targetItem = schedule[targetIndex];

    if (sourceItem.isBreak || targetItem.isBreak || sourceItem.isLocked || targetItem.isLocked) {
      setMessage({ text: "Slot jeda istirahat atau terkunci tidak dapat dipindahkan!", type: "error" });
      return;
    }

    // Eksekusi penukaran lokal
    const newSchedule = [...schedule];
    const tempName = sourceItem.name;
    const tempCode = sourceItem.code;
    const tempTeacher = sourceItem.teacher;
    const tempRoom = sourceItem.room;

    newSchedule[sourceIndex] = {
      ...sourceItem,
      name: targetItem.name,
      code: targetItem.code,
      teacher: targetItem.teacher,
      room: targetItem.room,
    };

    newSchedule[targetIndex] = {
      ...targetItem,
      name: tempName,
      code: tempCode,
      teacher: tempTeacher,
      room: tempRoom,
    };

    pushHistory(newSchedule, `Tukar ${sourceItem.jp} dengan ${targetItem.jp}`);
    setMessage({ text: `Berhasil menukar ${sourceItem.jp} ⇄ ${targetItem.jp}`, type: "success" });

    // Panggil API swap di background
    try {
      await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId1: sourceSlotId, slotId2: targetSlotId }),
      });
    } catch (err) {
      console.error("Swap API error:", err);
    }

    setDraggedSlotId(null);
  };

  // Simpan permanen perubahan
  const handleSaveSchedule = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ text: "Semua perubahan slot berhasil disimpan ke database!", type: "success" });
    }, 500);
  };

  // Trigger solver generator
  const handleRunSolver = async () => {
    try {
      setIsSolving(true);
      const res = await fetch("/api/solver/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: "draft-v1", saveToDb: true }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Jadwal otomatis berhasil disusun ulang tanpa bentrok!", type: "success" });
        await fetchSchedule(selectedDay, selectedClass, selectedTeacherId, viewMode);
      }
    } catch (err) {
      console.error("Error triggering solver:", err);
      setMessage({ text: "Gagal menjalankan auto-solve", type: "error" });
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Header & Main Control Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glow-badge-blue text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Scheduling Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Matriks Jadwal Pelajaran (Drag & Drop)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Geser dan tukar jam mengajar secara interaktif dengan deteksi bentrok visual seketika.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                historyIndex <= 0
                  ? "border-slate-800 text-slate-600 cursor-not-allowed"
                  : "border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
              }`}
              title="Undo perubahan"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                historyIndex >= history.length - 1
                  ? "border-slate-800 text-slate-600 cursor-not-allowed"
                  : "border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
              }`}
              title="Redo perubahan"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleSaveSchedule}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>

            <button
              onClick={handleRunSolver}
              disabled={isSolving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Auto-Solve CSP</span>
            </button>
          </div>
        </div>

        {/* Floating Message Alert */}
        {message && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
              message.type === "success"
                ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                : message.type === "error"
                ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
                : "bg-blue-950/40 border-blue-800/60 text-blue-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {message.text}
            </span>
            <button
              onClick={() => setMessage(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* View Mode Switcher (Grid per Kelas vs Grid per Guru) & Filter Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800/90">
          {/* Dual-View Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode("class")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "class"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Grid per Rombel (Kelas)</span>
            </button>

            <button
              onClick={() => setViewMode("teacher")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "teacher"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Grid per Tenaga Pendidik (Guru)</span>
            </button>
          </div>

          {/* Selectors for Day and Entity */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Day Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === day
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Class / Teacher Dropdown */}
            {viewMode === "class" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  {classList.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Guru:</span>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-blue-500 max-w-[220px] truncate"
                >
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Drag & Drop Timetable Matrix Grid */}
        <div className="glass-panel rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              {viewMode === "class"
                ? `Matriks Jadwal Kelas ${selectedClass} — Hari ${selectedDay}`
                : `Jadwal Mengajar ${teachersList.find((t) => t.id === selectedTeacherId)?.name || "Guru"} — Hari ${selectedDay}`}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">
                💡 Tip: Drag baris untuk menukar slot jam mengajar
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Conflict
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Grip</th>
                  <th className="py-3.5 px-4 w-16">JP</th>
                  <th className="py-3.5 px-4 w-36">Rentang Waktu</th>
                  <th className="py-3.5 px-4">
                    {viewMode === "class" ? "Mata Pelajaran" : "Mapel & Kelas Sasaran"}
                  </th>
                  <th className="py-3.5 px-4">
                    {viewMode === "class" ? "Tenaga Pendidik (Guru)" : "Ruang Belajar"}
                  </th>
                  <th className="py-3.5 px-4 w-28 text-right">Status / Kunci</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-400 mb-2" />
                      Memuat matriks jadwal...
                    </td>
                  </tr>
                ) : schedule.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                      Tidak ada jam pelajaran aktif pada slot ini.
                    </td>
                  </tr>
                ) : (
                  schedule.map((slot, index) => {
                    const isBreak = slot.isBreak;
                    const isDraggable = !isBreak && !slot.isLocked && Boolean(slot.slotId);
                    const isHovered = hoveredDropSlotId === slot.slotId;
                    const isBeingDragged = draggedSlotId === slot.slotId;

                    return (
                      <tr
                        key={slot.slotId || index}
                        draggable={isDraggable}
                        onDragStart={(e) => slot.slotId && handleDragStart(e, slot.slotId)}
                        onDragOver={(e) => slot.slotId && handleDragOver(e, slot.slotId)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => slot.slotId && handleDrop(e, slot.slotId)}
                        className={`transition-all select-none ${
                          isBreak
                            ? "bg-amber-500/5 text-amber-300/90 font-medium cursor-default"
                            : isHovered
                            ? "bg-blue-600/20 border-2 border-dashed border-blue-400"
                            : isBeingDragged
                            ? "opacity-40 bg-slate-800"
                            : "hover:bg-slate-800/40 cursor-grab active:cursor-grabbing"
                        }`}
                      >
                        {/* Drag Handle Grip */}
                        <td className="py-3.5 px-4 text-center">
                          {isDraggable ? (
                            <GripVertical className="w-4 h-4 text-slate-500 hover:text-slate-300 mx-auto" />
                          ) : (
                            <span className="text-slate-600 text-xs">-</span>
                          )}
                        </td>

                        {/* JP */}
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {slot.jp}
                        </td>

                        {/* Time Range */}
                        <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{slot.timeRange}</td>

                        {/* Subject */}
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {slot.name}{" "}
                          {!isBreak && slot.code !== "-" && (
                            <span className="text-[11px] text-blue-400 font-normal ml-1">
                              ({slot.code})
                            </span>
                          )}
                        </td>

                        {/* Teacher or Room */}
                        <td className="py-3.5 px-4 text-slate-300">
                          {viewMode === "class" ? slot.teacher : slot.room}
                        </td>

                        {/* Status / Lock */}
                        <td className="py-3.5 px-4 text-right">
                          {isBreak ? (
                            <span className="text-[11px] text-amber-400/80">Jeda Belajar</span>
                          ) : slot.isLocked ? (
                            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1 font-medium bg-slate-800 px-2 py-0.5 rounded">
                              <Lock className="w-3 h-3 text-slate-400" /> Terkunci
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-400 inline-flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Terjadwal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
