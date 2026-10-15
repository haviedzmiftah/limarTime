"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Layers, Calendar, Filter, Download, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function MatrixPreviewPage() {
  const [selectedDay, setSelectedDay] = useState("SENIN");

  const days = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"];

  const sampleSlots = [
    { period: 1, time: "08.00 - 08.40", code: "MAT", name: "Matematika", teacher: "ST", room: "R-7A" },
    { period: 2, time: "08.40 - 09.20", code: "MAT", name: "Matematika", teacher: "ST", room: "R-7A" },
    { period: 3, time: "09.20 - 10.00", code: "IPA", name: "IPA Terpadu", teacher: "WS", room: "Lab IPA" },
    { period: "Break", time: "10.00 - 10.20", code: "IST", name: "Istirahat / MBG", teacher: "-", room: "-" },
    { period: 4, time: "10.20 - 11.00", code: "IPA", name: "IPA Terpadu", teacher: "WS", room: "Lab IPA" },
    { period: 5, time: "11.00 - 11.40", code: "BIN", name: "Bahasa Indonesia", teacher: "AB", room: "R-7A" },
    { period: 6, time: "11.40 - 12.20", code: "BIN", name: "Bahasa Indonesia", teacher: "AB", room: "R-7A" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glow-badge-blue text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Scheduling Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Matriks Jadwal Pelajaran</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pratinjau grid alokasi jam belajar per rombel dan per guru dengan validasi bentrok instan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors">
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Ekspor PDF/Excel</span>
            </button>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDay === day
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "glass-panel-subtle text-slate-400 hover:text-white"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Timetable Table */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Jadwal Kelas 7A — Hari {selectedDay}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero Conflict Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">JP</th>
                  <th className="py-3 px-4">Rentang Waktu</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Guru Pengampu</th>
                  <th className="py-3 px-4">Ruang</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sampleSlots.map((slot, index) => {
                  const isBreak = slot.period === "Break";
                  return (
                    <tr
                      key={index}
                      className={isBreak ? "bg-amber-500/5 text-amber-300/80" : "hover:bg-slate-800/30"}
                    >
                      <td className="py-3 px-4 font-mono font-bold">
                        {isBreak ? "-" : `JP ${slot.period}`}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-xs">{slot.time}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {slot.name} {!isBreak && <span className="text-xs text-blue-400 font-normal">({slot.code})</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{slot.teacher}</td>
                      <td className="py-3 px-4 text-slate-400">{slot.room}</td>
                      <td className="py-3 px-4 text-right">
                        {!isBreak && (
                          <button className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium">
                            <ArrowLeftRight className="w-3.5 h-3.5" /> Swap
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
