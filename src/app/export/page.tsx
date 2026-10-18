"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Printer,
  FileSpreadsheet,
  FileText,
  Users,
  GraduationCap,
  Calendar,
  Download,
  CheckCircle2,
  ChevronRight,
  Eye,
} from "lucide-react";

interface TeacherItem {
  id: string;
  code: string;
  name: string;
  nip: string | null;
  mainSubject: string;
}

interface ClassroomItem {
  id: string;
  name: string;
  gradeLevel: number;
}

export default function ExportCenterPage() {
  const [activeTab, setActiveTab] = useState<"class" | "teacher" | "master">("class");
  const [selectedClass, setSelectedClass] = useState("7A");
  const [selectedTeacherId, setSelectedTeacherId] = useState("T01");
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [classrooms, setClassrooms] = useState<string[]>([
    "7A", "7B", "7C", "7D", "7E", "7F", "7G", "7H", "7I", "7J",
    "8A", "8B", "8C", "8D", "8E", "8F", "8G", "8H", "8I", "8J",
    "9A", "9B", "9C", "9D", "9E", "9F", "9G", "9H", "9I", "9J",
  ]);

  useEffect(() => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.teachers) {
          setTeachers(data.teachers);
        }
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Header - Screen Only */}
        <div className="print:hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glow-badge-blue text-xs font-semibold">
              <Printer className="w-3.5 h-3.5" />
              <span>Pusat Cetak & Ekspor Dokumen Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Dokumen Administrasi Penjadwalan
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cetak Jadwal Dinding Kelas, Kartu Jadwal 55 Guru, dan Unduh Master Timetable format Excel (.xlsx)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/export/excel?versionId=draft-v1"
              download
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Excel (.xlsx)</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen (PDF)</span>
            </button>
          </div>
        </div>

        {/* Tab Selection - Screen Only */}
        <div className="print:hidden flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab("class")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "class"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Jadwal Dinding Kelas (30 Lembar)</span>
          </button>

          <button
            onClick={() => setActiveTab("teacher")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "teacher"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kartu Jadwal Guru (55 Lembar)</span>
          </button>

          <button
            onClick={() => setActiveTab("master")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "master"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Master Matriks Sekolah</span>
          </button>
        </div>

        {/* Entity Selector (Class or Teacher) - Screen Only */}
        <div className="print:hidden flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-3">
            {activeTab === "class" && (
              <>
                <span className="text-xs text-slate-400 font-semibold">Pilih Lembar Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                >
                  {classrooms.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>
              </>
            )}

            {activeTab === "teacher" && (
              <>
                <span className="text-xs text-slate-400 font-semibold">Pilih Lembar Guru:</span>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none max-w-[280px] truncate"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {activeTab === "master" && (
              <span className="text-xs text-slate-400">
                Pratinjau format cetak A3 / Folio Landscape untuk ruang guru dan arsip kurikulum.
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Siap Cetak (A4 Portrait / Landscape)
          </div>
        </div>

        {/* Printable Paper Area (Styled like official paper document) */}
        <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200 print:p-0 print:border-none print:shadow-none print:rounded-none">
          {/* KOP Surat Resmi SMPN 1 Ngawi */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <div className="text-sm font-semibold tracking-wider text-slate-700 uppercase">
              Pemerintah Kabupaten Ngawi • Dinas Pendidikan dan Kebudayaan
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">
              SMP NEGERI 1 NGAWI
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Jl. Ronggowarsito No. 1, Karang Asri, Kec. Ngawi, Kabupaten Ngawi, Jawa Timur 63218
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2">
              SK KURIKULUM: 400.3.5.1/269/404.301.3.01/2026 • SEMESTER GANJIL TAHUN AJARAN 2026/2027
            </div>
          </div>

          {/* Subheader Document Title */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-300 pb-2">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {activeTab === "class"
                  ? "JADWAL DINDING KELAS"
                  : activeTab === "teacher"
                  ? "KARTU BEBAN MENGAJAR GURU"
                  : "JADWAL INDUK PEMBELAJARAN (MASTER)"}
              </span>
              <h2 className="text-lg font-black text-slate-900">
                {activeTab === "class"
                  ? `JADWAL BELAJAR ROMBEL ${selectedClass}`
                  : activeTab === "teacher"
                  ? `${teachers.find((t) => t.id === selectedTeacherId)?.name || "GURU"} (KODE: ${
                      teachers.find((t) => t.id === selectedTeacherId)?.code || "-"
                    })`
                  : "REKAPITULASI MASTER TIMETABLE 30 ROMBEL"}
              </h2>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div>Berlaku Efektif: <strong>17 Agustus 2026</strong></div>
              <div>Status: <span className="text-emerald-700 font-bold">Resmi (Zero Conflict)</span></div>
            </div>
          </div>

          {/* Printable Weekly Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-400">
                  <th className="border border-slate-400 py-2.5 px-3 text-center w-12">JP</th>
                  <th className="border border-slate-400 py-2.5 px-3 text-center w-28">WAKTU</th>
                  <th className="border border-slate-400 py-2.5 px-3">SENIN</th>
                  <th className="border border-slate-400 py-2.5 px-3">SELASA</th>
                  <th className="border border-slate-400 py-2.5 px-3">RABU</th>
                  <th className="border border-slate-400 py-2.5 px-3">KAMIS</th>
                  <th className="border border-slate-400 py-2.5 px-3">JUMAT</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { jp: "0", time: "07.00 - 08.00", senin: "Upacara Bendera", selasa: "Pembiasaan", rabu: "Pembiasaan", kamis: "Pembiasaan", jumat: "Adiwiyata / Senam" },
                  { jp: "1", time: "08.00 - 08.40", senin: "MAT (ST)", selasa: "BIND (WS)", rabu: "IPA (HF)", kamis: "BING (AB)", jumat: "PAI (TO)" },
                  { jp: "2", time: "08.40 - 09.20", senin: "MAT (ST)", selasa: "BIND (WS)", rabu: "IPA (HF)", kamis: "BING (AB)", jumat: "PAI (TO)" },
                  { jp: "Jeda", time: "09.20 - 09.50", senin: "Istirahat", selasa: "Istirahat", rabu: "Istirahat", kamis: "Istirahat", jumat: "Istirahat" },
                  { jp: "3", time: "09.50 - 10.30", senin: "BING (AB)", selasa: "IPS (RY)", rabu: "PJOK (FJ)", kamis: "INF (RT)", jumat: "PKN (ST)" },
                  { jp: "4", time: "10.30 - 11.10", senin: "BING (AB)", selasa: "IPS (RY)", rabu: "PJOK (FJ)", kamis: "INF (RT)", jumat: "MBG / Jumat Berkah" },
                  { jp: "5", time: "11.10 - 12.00", senin: "Kokurikuler Mengaji", selasa: "SENI (RM)", rabu: "PRAK (WG)", kamis: "MAT (ST)", jumat: "Pramuka / Ekstra" },
                  { jp: "Jeda", time: "12.00 - 13.00", senin: "Sholat / MBG", selasa: "Sholat / MBG", rabu: "Sholat / MBG", kamis: "Sholat / MBG", jumat: "Sholat Jumat" },
                  { jp: "6", time: "13.00 - 13.40", senin: "IPA (HF)", selasa: "SENI (RM)", rabu: "PRAK (WG)", kamis: "MAT (ST)", jumat: "-" },
                  { jp: "7", time: "13.40 - 14.20", senin: "IPA (HF)", selasa: "BDAE (JB)", rabu: "BDAE (JB)", kamis: "IPS (RY)", jumat: "-" },
                  { jp: "8", time: "14.20 - 14.30", senin: "Kebersihan", selasa: "Kebersihan", rabu: "Kebersihan", kamis: "Kebersihan", jumat: "-" },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      row.jp === "Jeda"
                        ? "bg-slate-100/80 font-semibold text-slate-700 text-center"
                        : "hover:bg-slate-50"
                    }
                  >
                    <td className="border border-slate-400 py-2 px-2 text-center font-bold">
                      {row.jp === "Jeda" ? "-" : row.jp}
                    </td>
                    <td className="border border-slate-400 py-2 px-2 text-center font-mono text-[11px]">
                      {row.time}
                    </td>
                    <td className="border border-slate-400 py-2 px-3">{row.senin}</td>
                    <td className="border border-slate-400 py-2 px-3">{row.selasa}</td>
                    <td className="border border-slate-400 py-2 px-3">{row.rabu}</td>
                    <td className="border border-slate-400 py-2 px-3">{row.kamis}</td>
                    <td className="border border-slate-400 py-2 px-3">{row.jumat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Pengesahan Resmi */}
          <div className="mt-8 flex items-end justify-between text-xs text-slate-800">
            <div>
              <div>Mengetahui,</div>
              <div className="font-semibold">Wakil Kepala Sekolah Bidang Kurikulum</div>
              <div className="h-16"></div>
              <div className="font-bold underline">SULISTIONO, S.Pd.I.</div>
              <div>NIP. 197508122005011004</div>
            </div>

            <div className="text-right">
              <div>Ngawi, 17 Agustus 2026</div>
              <div className="font-semibold">Kepala SMP Negeri 1 Ngawi</div>
              <div className="h-16"></div>
              <div className="font-bold underline">TARKUM, S.Pd.</div>
              <div>NIP. 196611071992031006</div>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
