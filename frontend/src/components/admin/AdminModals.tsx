import { AlertCircle } from "lucide-react";
import { ScheduleSlot, Subject, Teacher } from "@/types/admin";

interface AdminModalsProps {
  // Slot Modal
  editingSlot: ScheduleSlot | null;
  setEditingSlot: (slot: ScheduleSlot | null) => void;
  selectedClass: string;
  selectedDay: string;
  editSubjectId: string;
  setEditSubjectId: (id: string) => void;
  editTeacherId: string;
  setEditTeacherId: (id: string) => void;
  editRoom: string;
  setEditRoom: (room: string) => void;
  editLocked: boolean;
  setEditLocked: (locked: boolean) => void;
  onSaveSlot: (e: React.FormEvent) => void;
  subjectsList: Subject[];
  teachersList: Teacher[];

  // Teacher Modals
  isTeacherModalOpen: boolean;
  setIsTeacherModalOpen: (open: boolean) => void;
  editingTeacher: Teacher | null;
  teacherFormData: {
    code: string;
    name: string;
    nip: string;
    mainSubject: string;
    maxJpPerWeek: number;
    maxJpPerDay: number;
  };
  setTeacherFormData: any;
  onSubmitTeacher: (e: React.FormEvent) => void;
  isSubmittingTeacher: boolean;
  deletingTeacher: Teacher | null;
  setDeletingTeacher: (teacher: Teacher | null) => void;
  onConfirmDeleteTeacher: () => void;

  // Subject Modals
  isSubjectModalOpen: boolean;
  setIsSubjectModalOpen: (open: boolean) => void;
  editingSubject: Subject | null;
  subjectFormData: {
    code: string;
    name: string;
    targetJpPerWeek: number;
    roomType: string;
  };
  setSubjectFormData: any;
  onSubmitSubject: (e: React.FormEvent) => void;
  isSubmittingSubject: boolean;
  deletingSubject: Subject | null;
  setDeletingSubject: (subject: Subject | null) => void;
  onConfirmDeleteSubject: () => void;
}

export function AdminModals({
  editingSlot,
  setEditingSlot,
  selectedClass,
  selectedDay,
  editSubjectId,
  setEditSubjectId,
  editTeacherId,
  setEditTeacherId,
  editRoom,
  setEditRoom,
  editLocked,
  setEditLocked,
  onSaveSlot,
  subjectsList,
  teachersList,
  isTeacherModalOpen,
  setIsTeacherModalOpen,
  editingTeacher,
  teacherFormData,
  setTeacherFormData,
  onSubmitTeacher,
  isSubmittingTeacher,
  deletingTeacher,
  setDeletingTeacher,
  onConfirmDeleteTeacher,
  isSubjectModalOpen,
  setIsSubjectModalOpen,
  editingSubject,
  subjectFormData,
  setSubjectFormData,
  onSubmitSubject,
  isSubmittingSubject,
  deletingSubject,
  setDeletingSubject,
  onConfirmDeleteSubject,
}: AdminModalsProps) {
  return (
    <>
      {/* 1. EDIT SCHEDULE SLOT MODAL */}
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

            <form onSubmit={onSaveSlot} className="p-6 space-y-4 text-xs">
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

      {/* 2. MODAL TAMBAH / EDIT GURU */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">
                  {editingTeacher ? `Edit Data Guru: ${editingTeacher.name}` : "Tambah Guru Baru"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Lengkapi identitas, inisial kode mengajar, dan batas maksimal JP
                </p>
              </div>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmitTeacher} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Kode Guru <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="e.g. WS"
                    value={teacherFormData.code}
                    onChange={(e) =>
                      setTeacherFormData({ ...teacherFormData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 uppercase font-mono font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">
                    Nama Lengkap & Gelar <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dra. Sri Wahyuni, M.Pd."
                    value={teacherFormData.name}
                    onChange={(e) =>
                      setTeacherFormData({ ...teacherFormData, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    type="text"
                    placeholder="19700101..."
                    value={teacherFormData.nip}
                    onChange={(e) =>
                      setTeacherFormData({ ...teacherFormData, nip: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Mata Pelajaran Utama
                  </label>
                  <select
                    value={teacherFormData.mainSubject}
                    onChange={(e) =>
                      setTeacherFormData({ ...teacherFormData, mainSubject: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Mapel --</option>
                    {subjectsList.map((s) => (
                      <option key={s.id} value={s.code}>
                        [{s.code}] {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Maks JP / Minggu
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={teacherFormData.maxJpPerWeek}
                    onChange={(e) =>
                      setTeacherFormData({
                        ...teacherFormData,
                        maxJpPerWeek: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Maks JP / Hari
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={teacherFormData.maxJpPerDay}
                    onChange={(e) =>
                      setTeacherFormData({
                        ...teacherFormData,
                        maxJpPerDay: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTeacher}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmittingTeacher ? "Menyimpan..." : "Simpan Guru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL KONFIRMASI HAPUS GURU */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-xs">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Hapus Data Guru?</h3>
                <p className="text-slate-400 text-[11px]">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus data pengajar{" "}
              <strong className="text-white font-semibold">
                {deletingTeacher.name} ({deletingTeacher.code})
              </strong>
              ? Seluruh jadwal pengampu terkait guru ini akan dilepas dan menjadi slot kosong.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingTeacher(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteTeacher}
                disabled={isSubmittingTeacher}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {isSubmittingTeacher ? "Menghapus..." : "Ya, Hapus Guru"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL TAMBAH / EDIT MATA PELAJARAN */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">
                  {editingSubject
                    ? `Edit Mata Pelajaran: ${editingSubject.name}`
                    : "Tambah Mata Pelajaran Baru"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tentukan kode kurikulum, beban target JP/minggu, dan alokasi ruangan
                </p>
              </div>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmitSubject} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Kode Mapel <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="e.g. MAT"
                    value={subjectFormData.code}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 uppercase font-mono font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">
                    Nama Mata Pelajaran <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Matematika"
                    value={subjectFormData.name}
                    onChange={(e) =>
                      setSubjectFormData({ ...subjectFormData, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Target JP / Minggu <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={subjectFormData.targetJpPerWeek}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        targetJpPerWeek: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Kebutuhan Ruangan
                  </label>
                  <select
                    value={subjectFormData.roomType}
                    onChange={(e) =>
                      setSubjectFormData({ ...subjectFormData, roomType: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="Reguler">Kelas Reguler</option>
                    <option value="Lab Komputer">Lab Komputer</option>
                    <option value="Lab IPA">Lab IPA</option>
                    <option value="Lapangan Olahraga">Lapangan Olahraga</option>
                    <option value="Ruang Seni / Musik">Ruang Seni / Musik</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSubject}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmittingSubject ? "Menyimpan..." : "Simpan Mapel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL KONFIRMASI HAPUS MATA PELAJARAN */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-xs">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Hapus Mata Pelajaran?</h3>
                <p className="text-slate-400 text-[11px]">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus mata pelajaran{" "}
              <strong className="text-white font-semibold">
                {deletingSubject.name} ({deletingSubject.code})
              </strong>
              ? Seluruh jadwal slot yang menggunakan mata pelajaran ini akan dikosongkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteSubject}
                disabled={isSubmittingSubject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {isSubmittingSubject ? "Menghapus..." : "Ya, Hapus Mapel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
