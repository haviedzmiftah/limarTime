import { Search, Plus, Edit3, Trash2 } from "lucide-react";
import { Subject } from "@/types/admin";

interface SubjectsTabProps {
  subjectsList: Subject[];
  subjectSearchQuery: string;
  setSubjectSearchQuery: (query: string) => void;
  onOpenAddSubject: () => void;
  onOpenEditSubject: (subject: Subject) => void;
  onConfirmDelete: (subject: Subject) => void;
}

export function SubjectsTab({
  subjectsList,
  subjectSearchQuery,
  setSubjectSearchQuery,
  onOpenAddSubject,
  onOpenEditSubject,
  onConfirmDelete,
}: SubjectsTabProps) {
  const filteredSubjects = subjectsList.filter(
    (sub) =>
      sub.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(subjectSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama atau kode mata pelajaran..."
            value={subjectSearchQuery}
            onChange={(e) => setSubjectSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={onOpenAddSubject}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Tambah Mata Pelajaran
        </button>
      </div>

      {/* Subjects Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Mapel</th>
                <th className="px-4 py-3">Nama Mata Pelajaran</th>
                <th className="px-4 py-3">Target JP / Minggu</th>
                <th className="px-4 py-3">Tipe Ruangan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubjects.map((sub) => (
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
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEditSubject(sub)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-all flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => onConfirmDelete(sub)}
                        className="p-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/30 border border-rose-500/20 text-rose-400 transition-all"
                        title="Hapus Mata Pelajaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
