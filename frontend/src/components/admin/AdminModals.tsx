import { ScheduleSlot, Subject, Teacher, BellSchedule } from "@/types/admin";
import { Button, Input, Select, Checkbox, Modal } from "@/components/ui";
import { AlertCircle } from "lucide-react";

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

  // Bell Schedules Modals (Hari & Jam)
  days: string[];
  isBellModalOpen: boolean;
  setIsBellModalOpen: (open: boolean) => void;
  editingBell: BellSchedule | null;
  bellFormData: {
    day: string;
    jp: number;
    timeRange: string;
    durationMinutes: number;
    isBreak: boolean;
    breakName: string;
  };
  setBellFormData: any;
  onSubmitBell: (e: React.FormEvent) => void;
  isSubmittingBell: boolean;
  deletingBell: BellSchedule | null;
  setDeletingBell: (bell: BellSchedule | null) => void;
  onConfirmDeleteBell: () => void;
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
  days,
  isBellModalOpen,
  setIsBellModalOpen,
  editingBell,
  bellFormData,
  setBellFormData,
  onSubmitBell,
  isSubmittingBell,
  deletingBell,
  setDeletingBell,
  onConfirmDeleteBell,
}: AdminModalsProps) {
  return (
    <>
      {/* 1. EDIT SCHEDULE SLOT MODAL */}
      <Modal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        title="Edit Slot Pembelajaran"
        subtitle={
          editingSlot
            ? `Kelas ${selectedClass} • ${selectedDay} • ${editingSlot.jp} (${editingSlot.timeRange})`
            : undefined
        }
        maxWidth="md"
      >
        {editingSlot && (
          <form onSubmit={onSaveSlot} className="space-y-4 text-xs">
            <Select
              label="Mata Pelajaran"
              value={editSubjectId}
              onChange={(e) => setEditSubjectId(e.target.value)}
            >
              <option value="">-- Kosong / Mandiri --</option>
              {subjectsList.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.code}] {s.name}
                </option>
              ))}
            </Select>

            <Select
              label="Guru Pengampu"
              value={editTeacherId}
              onChange={(e) => setEditTeacherId(e.target.value)}
            >
              <option value="">-- Pilih Guru --</option>
              {teachersList.map((t) => (
                <option key={t.id} value={t.id}>
                  ({t.code}) {t.name}
                </option>
              ))}
            </Select>

            <Select
              label="Ruangan"
              value={editRoom}
              onChange={(e) => setEditRoom(e.target.value)}
            >
              <option value="Kelas">Kelas Reguler</option>
              <option value="Lab Komputer">Lab Komputer</option>
              <option value="Lab IPA">Lab IPA</option>
              <option value="Lapangan Olahraga">Lapangan Olahraga</option>
              <option value="Ruang Seni / Musik">Ruang Seni / Musik</option>
            </Select>

            <div className="pt-2">
              <Checkbox
                label="Kunci Slot Ini"
                description="Mencegah slot ini diubah atau digeser oleh auto-solver"
                checked={editLocked}
                onChange={(e) => setEditLocked(e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingSlot(null)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 2. MODAL TAMBAH / EDIT GURU */}
      <Modal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        title={editingTeacher ? `Edit Data Guru: ${editingTeacher.name}` : "Tambah Guru Baru"}
        subtitle="Lengkapi identitas, inisial kode mengajar, dan batas maksimal JP"
        maxWidth="lg"
      >
        <form onSubmit={onSubmitTeacher} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                label="Kode Guru"
                maxLength={5}
                placeholder="e.g. WS"
                value={teacherFormData.code}
                onChange={(e) =>
                  setTeacherFormData({ ...teacherFormData, code: e.target.value.toUpperCase() })
                }
                className="uppercase font-mono font-bold"
                isRequired
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Nama Lengkap & Gelar"
                placeholder="e.g. Dra. Sri Wahyuni, M.Pd."
                value={teacherFormData.name}
                onChange={(e) =>
                  setTeacherFormData({ ...teacherFormData, name: e.target.value })
                }
                isRequired
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="NIP (Nomor Induk Pegawai)"
                placeholder="19700101..."
                value={teacherFormData.nip}
                onChange={(e) =>
                  setTeacherFormData({ ...teacherFormData, nip: e.target.value })
                }
                className="font-mono"
              />
            </div>

            <div>
              <Select
                label="Mata Pelajaran Utama"
                value={teacherFormData.mainSubject}
                onChange={(e) =>
                  setTeacherFormData({ ...teacherFormData, mainSubject: e.target.value })
                }
              >
                <option value="">-- Pilih Mapel --</option>
                {subjectsList.map((s) => (
                  <option key={s.id} value={s.code}>
                    [{s.code}] {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <Input
                label="Maks JP / Minggu"
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
              />
            </div>

            <div>
              <Input
                label="Maks JP / Hari"
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
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTeacherModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingTeacher}
            >
              Simpan Guru
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. MODAL KONFIRMASI HAPUS GURU */}
      <Modal
        isOpen={!!deletingTeacher}
        onClose={() => setDeletingTeacher(null)}
        title="Hapus Data Guru?"
        subtitle="Tindakan ini tidak dapat dibatalkan"
        maxWidth="md"
      >
        {deletingTeacher && (
          <div className="text-xs space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus data pengajar{" "}
                <strong className="text-white font-semibold">
                  {deletingTeacher.name} ({deletingTeacher.code})
                </strong>
                ? Seluruh jadwal pengampu terkait guru ini akan dilepas dan menjadi slot kosong.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingTeacher(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isSubmittingTeacher}
                onClick={onConfirmDeleteTeacher}
              >
                Ya, Hapus Guru
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. MODAL TAMBAH / EDIT MATA PELAJARAN */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={
          editingSubject
            ? `Edit Mata Pelajaran: ${editingSubject.name}`
            : "Tambah Mata Pelajaran Baru"
        }
        subtitle="Tentukan kode kurikulum, beban target JP/minggu, dan alokasi ruangan"
        maxWidth="lg"
      >
        <form onSubmit={onSubmitSubject} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                label="Kode Mapel"
                maxLength={8}
                placeholder="e.g. MAT"
                value={subjectFormData.code}
                onChange={(e) =>
                  setSubjectFormData({
                    ...subjectFormData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="uppercase font-mono font-bold"
                isRequired
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Nama Mata Pelajaran"
                placeholder="e.g. Matematika"
                value={subjectFormData.name}
                onChange={(e) =>
                  setSubjectFormData({ ...subjectFormData, name: e.target.value })
                }
                isRequired
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <Input
                label="Target JP / Minggu"
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
                isRequired
              />
            </div>

            <div>
              <Select
                label="Kebutuhan Ruangan"
                value={subjectFormData.roomType}
                onChange={(e) =>
                  setSubjectFormData({ ...subjectFormData, roomType: e.target.value })
                }
              >
                <option value="Reguler">Kelas Reguler</option>
                <option value="Lab Komputer">Lab Komputer</option>
                <option value="Lab IPA">Lab IPA</option>
                <option value="Lapangan Olahraga">Lapangan Olahraga</option>
                <option value="Ruang Seni / Musik">Ruang Seni / Musik</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSubjectModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingSubject}
            >
              Simpan Mapel
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. MODAL KONFIRMASI HAPUS MATA PELAJARAN */}
      <Modal
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        title="Hapus Mata Pelajaran?"
        subtitle="Tindakan ini tidak dapat dibatalkan"
        maxWidth="md"
      >
        {deletingSubject && (
          <div className="text-xs space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus mata pelajaran{" "}
                <strong className="text-white font-semibold">
                  {deletingSubject.name} ({deletingSubject.code})
                </strong>
                ? Seluruh jadwal slot yang menggunakan mata pelajaran ini akan dikosongkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingSubject(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isSubmittingSubject}
                onClick={onConfirmDeleteSubject}
              >
                Ya, Hapus Mapel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. MODAL TAMBAH / EDIT JAM BELAJAR (BELL SCHEDULE) */}
      <Modal
        isOpen={isBellModalOpen}
        onClose={() => setIsBellModalOpen(false)}
        title={editingBell ? "Edit Jam Belajar / Istirahat" : "Tambah Jam Belajar / Istirahat"}
        subtitle="Konfigurasikan JP, rentang jam, dan jenis kegiatan KBM/Istirahat"
        maxWidth="md"
      >
        <form onSubmit={onSubmitBell} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Hari"
              value={bellFormData.day}
              onChange={(e) =>
                setBellFormData({ ...bellFormData, day: e.target.value })
              }
              disabled={!!editingBell}
              hint={editingBell ? "Hari tidak dapat diubah saat edit" : undefined}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>

            <Input
              label="Jam Ke- (JP)"
              type="number"
              min="0"
              max="12"
              value={bellFormData.jp}
              onChange={(e) =>
                setBellFormData({
                  ...bellFormData,
                  jp: parseInt(e.target.value) || 0,
                })
              }
              disabled={!!editingBell}
              hint="0 untuk Upacara/Literasi, 1-8 untuk KBM"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Rentang Waktu"
              placeholder="Contoh: 07.00 - 07.40"
              value={bellFormData.timeRange}
              onChange={(e) =>
                setBellFormData({ ...bellFormData, timeRange: e.target.value })
              }
              hint="Format: HH.MM - HH.MM"
              required
            />

            <Input
              label="Durasi (Menit)"
              type="number"
              min="5"
              max="120"
              value={bellFormData.durationMinutes}
              onChange={(e) =>
                setBellFormData({
                  ...bellFormData,
                  durationMinutes: parseInt(e.target.value) || 40,
                })
              }
              hint="Standar: 40 menit (Jumat: 30 menit)"
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <Checkbox
              id="isBreakCheckbox"
              label="Bukan KBM (Istirahat / Upacara / Literasi)"
              checked={bellFormData.isBreak}
              onChange={(e) =>
                setBellFormData({
                  ...bellFormData,
                  isBreak: e.target.checked,
                  breakName: e.target.checked
                    ? bellFormData.breakName || "Istirahat"
                    : "",
                })
              }
              description="Centang jika jam ini bukan jam pelajaran efektif guru di kelas"
            />

            {bellFormData.isBreak && (
              <Input
                label="Nama Kegiatan / Istirahat"
                placeholder="Contoh: Istirahat 1, Upacara Bendera, Literasi"
                value={bellFormData.breakName}
                onChange={(e) =>
                  setBellFormData({
                    ...bellFormData,
                    breakName: e.target.value,
                  })
                }
                required={bellFormData.isBreak}
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsBellModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingBell}
            >
              Simpan Jadwal Bel
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. MODAL KONFIRMASI HAPUS JAM BELAJAR */}
      <Modal
        isOpen={!!deletingBell}
        onClose={() => setDeletingBell(null)}
        title="Hapus Jam Belajar?"
        subtitle="Tindakan ini tidak dapat dibatalkan"
        maxWidth="md"
      >
        {deletingBell && (
          <div className="text-xs space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus slot waktu{" "}
                <strong className="text-white font-semibold">
                  {deletingBell.day} - {deletingBell.jp === 0 ? "JP 0" : `JP ${deletingBell.jp}`} ({deletingBell.timeRange})
                </strong>
                ? Seluruh slot jadwal kelas pada hari dan JP ini juga akan dihapus.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingBell(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isSubmittingBell}
                onClick={onConfirmDeleteBell}
              >
                Ya, Hapus Jam
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
