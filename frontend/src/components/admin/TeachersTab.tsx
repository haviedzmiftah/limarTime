import { Search, Plus, Edit3, Trash2 } from "lucide-react";
import { Teacher } from "@/types/admin";
import { Button, Input } from "@/components/ui";

interface TeachersTabProps {
  teachersList: Teacher[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddTeacher: () => void;
  onOpenEditTeacher: (teacher: Teacher) => void;
  onConfirmDelete: (teacher: Teacher) => void;
}

export function TeachersTab({
  teachersList,
  searchQuery,
  setSearchQuery,
  onOpenAddTeacher,
  onOpenEditTeacher,
  onConfirmDelete,
}: TeachersTabProps) {
  const filteredTeachers = teachersList.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nip && t.nip.includes(searchQuery))
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Cari nama guru, NIP, atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Button
          onClick={onOpenAddTeacher}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Tambah Guru Baru
        </Button>
      </div>

      {/* Teachers Table */}
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
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                      {teacher.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{teacher.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{teacher.nip || "-"}</td>
                  <td className="px-4 py-3 text-slate-300">{teacher.mainSubject || "-"}</td>
                  <td className="px-4 py-3 text-slate-300 font-medium">
                    {teacher.maxJpPerWeek || 30} JP
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-medium">
                    {teacher.maxJpPerDay || 6} JP
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEditTeacher(teacher)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[11px] font-medium transition-all flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => onConfirmDelete(teacher)}
                        className="p-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/30 border border-rose-500/20 text-rose-400 transition-all"
                        title="Hapus Guru"
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
