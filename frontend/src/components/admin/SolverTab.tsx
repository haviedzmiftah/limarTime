import { Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";

interface SolverTabProps {
  isSolving: boolean;
  onRunSolver: () => void;
  solverResult: any;
}

export function SolverTab({ isSolving, onRunSolver, solverResult }: SolverTabProps) {
  return (
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
            onClick={onRunSolver}
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
  );
}
