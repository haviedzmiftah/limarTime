import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stats,
  Teacher,
  Classroom,
  Subject,
  ScheduleSlot,
  BellSchedule,
  ToastMessage,
} from "@/types/admin";

export function useAdmin() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "teachers" | "subjects" | "bell" | "solver">("schedule");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Master Data & Statistics
  const [stats, setStats] = useState<Stats | null>(null);
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [classroomsList, setClassroomsList] = useState<Classroom[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);

  // Schedule Tab State
  const [selectedDay, setSelectedDay] = useState("Senin");
  const [selectedClass, setSelectedClass] = useState("7A");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Edit Slot Modal State
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editTeacherId, setEditTeacherId] = useState("");
  const [editRoom, setEditRoom] = useState("Kelas");
  const [editLocked, setEditLocked] = useState(false);

  // Search & Toast Notifications
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  // Teacher CRUD Modal State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherFormData, setTeacherFormData] = useState({
    code: "",
    name: "",
    nip: "",
    mainSubject: "",
    maxJpPerWeek: 30,
    maxJpPerDay: 6,
  });
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);

  // Subject CRUD Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    code: "",
    name: "",
    targetJpPerWeek: 2,
    roomType: "Reguler",
  });
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);

  // Bell Schedules (Hari & Jam) State
  const [bellSchedulesList, setBellSchedulesList] = useState<BellSchedule[]>([]);
  const [selectedBellDay, setSelectedBellDay] = useState("Senin");
  const [loadingBell, setLoadingBell] = useState(false);
  const [isBellModalOpen, setIsBellModalOpen] = useState(false);
  const [editingBell, setEditingBell] = useState<BellSchedule | null>(null);
  const [bellFormData, setBellFormData] = useState({
    day: "Senin",
    jp: 1,
    timeRange: "",
    durationMinutes: 40,
    isBreak: false,
    breakName: "",
  });
  const [deletingBell, setDeletingBell] = useState<BellSchedule | null>(null);
  const [isSubmittingBell, setIsSubmittingBell] = useState(false);

  // Solver Tab State
  const [isSolving, setIsSolving] = useState(false);
  const [solverResult, setSolverResult] = useState<any>(null);

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  // Helper Toast
  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Check Admin Authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth/check");
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace("/admin/login");
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.replace("/admin/login");
      }
    };
    checkAuth();
  }, [router]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/login", { method: "DELETE" });
      router.push("/admin/login");
    } catch (err) {
      router.push("/admin/login");
    }
  };

  // Load Master Data
  const loadMasterData = useCallback(async () => {
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
  }, []);

  // Load Schedule Grid
  const loadSchedule = useCallback(async () => {
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
  }, [selectedClass, selectedDay]);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Slot handlers
  const handleOpenEditSlot = (slot: ScheduleSlot) => {
    if (slot.isBreak) return;
    setEditingSlot(slot);
    setEditSubjectId(
      subjectsList.find((s) => s.name === slot.name || s.code === slot.code)?.id || ""
    );
    setEditTeacherId(slot.teacherId || "");
    setEditRoom(slot.room || "Kelas");
    setEditLocked(slot.isLocked || false);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    try {
      const res = await fetch("/api/admin/schedule-slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: selectedClass,
          day: selectedDay,
          jp: editingSlot.periodNum,
          subjectId: editSubjectId || null,
          teacherId: editTeacherId || null,
          room: editRoom,
          isLocked: editLocked,
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

  // Solver trigger
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

  // Teacher Handlers
  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setTeacherFormData({
      code: "",
      name: "",
      nip: "",
      mainSubject: "",
      maxJpPerWeek: 30,
      maxJpPerDay: 6,
    });
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTeacherFormData({
      code: teacher.code,
      name: teacher.name,
      nip: teacher.nip || "",
      mainSubject: teacher.mainSubject || "",
      maxJpPerWeek: teacher.maxJpPerWeek || 30,
      maxJpPerDay: teacher.maxJpPerDay || 6,
    });
    setIsTeacherModalOpen(true);
  };

  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFormData.code.trim() || !teacherFormData.name.trim()) {
      showToast("Kode dan nama guru wajib diisi.", "error");
      return;
    }

    try {
      setIsSubmittingTeacher(true);
      const isEdit = !!editingTeacher;
      const res = await fetch("/api/admin/teachers", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTeacher?.id,
          code: teacherFormData.code.trim().toUpperCase(),
          name: teacherFormData.name.trim(),
          nip: teacherFormData.nip.trim() || null,
          mainSubject: teacherFormData.mainSubject.trim() || null,
          maxJpPerWeek: Number(teacherFormData.maxJpPerWeek) || 30,
          maxJpPerDay: Number(teacherFormData.maxJpPerDay) || 6,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || (isEdit ? "Guru berhasil diupdate" : "Guru berhasil ditambah"));
        setIsTeacherModalOpen(false);
        setEditingTeacher(null);
        loadMasterData();
      } else {
        showToast(data.error || "Gagal menyimpan data guru.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat menyimpan data guru.", "error");
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  const handleConfirmDeleteTeacher = async () => {
    if (!deletingTeacher) return;
    try {
      setIsSubmittingTeacher(true);
      const res = await fetch(`/api/admin/teachers?id=${deletingTeacher.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Data guru berhasil dihapus.");
        setDeletingTeacher(null);
        loadMasterData();
        loadSchedule();
      } else {
        showToast(data.error || "Gagal menghapus data guru.", "error");
      }
    } catch (err) {
      showToast("Gagal menghapus data guru.", "error");
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  // Subject Handlers
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectFormData({
      code: "",
      name: "",
      targetJpPerWeek: 2,
      roomType: "Reguler",
    });
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectFormData({
      code: sub.code,
      name: sub.name,
      targetJpPerWeek: sub.targetJpPerWeek || 2,
      roomType: sub.roomType || "Reguler",
    });
    setIsSubjectModalOpen(true);
  };

  const handleSubmitSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectFormData.code.trim() || !subjectFormData.name.trim()) {
      showToast("Kode dan nama mata pelajaran wajib diisi.", "error");
      return;
    }

    try {
      setIsSubmittingSubject(true);
      const isEdit = !!editingSubject;
      const res = await fetch("/api/admin/subjects", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSubject?.id,
          code: subjectFormData.code.trim().toUpperCase(),
          name: subjectFormData.name.trim(),
          targetJpPerWeek: Number(subjectFormData.targetJpPerWeek) || 2,
          roomType: subjectFormData.roomType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || (isEdit ? "Mata pelajaran berhasil diupdate" : "Mata pelajaran berhasil ditambah"));
        setIsSubjectModalOpen(false);
        setEditingSubject(null);
        loadMasterData();
      } else {
        showToast(data.error || "Gagal menyimpan mata pelajaran.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat menyimpan mata pelajaran.", "error");
    } finally {
      setIsSubmittingSubject(false);
    }
  };

  const handleConfirmDeleteSubject = async () => {
    if (!deletingSubject) return;

    try {
      setIsSubmittingSubject(true);
      const res = await fetch(`/api/admin/subjects?id=${deletingSubject.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Mata pelajaran berhasil dihapus");
        setDeletingSubject(null);
        loadMasterData();
      } else {
        showToast(data.error || "Gagal menghapus mata pelajaran.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat menghapus mata pelajaran.", "error");
    } finally {
      setIsSubmittingSubject(false);
    }
  };

  // Load Bell Schedules
  const loadBellSchedules = useCallback(async () => {
    try {
      setLoadingBell(true);
      const res = await fetch(`/api/admin/bell-schedules?day=${selectedBellDay}`);
      const data = await res.json();
      if (data.success) {
        setBellSchedulesList(data.bellSchedules || []);
      }
    } catch (err) {
      console.error("Gagal memuat jadwal jam belajar:", err);
    } finally {
      setLoadingBell(false);
    }
  }, [selectedBellDay]);

  useEffect(() => {
    loadBellSchedules();
  }, [loadBellSchedules]);

  // Bell Schedules Handlers
  const handleOpenAddBell = () => {
    setEditingBell(null);
    const nextJp = bellSchedulesList.length > 0
      ? Math.max(...bellSchedulesList.map((b) => b.jp)) + 1
      : 1;
    setBellFormData({
      day: selectedBellDay,
      jp: nextJp,
      timeRange: "",
      durationMinutes: 40,
      isBreak: false,
      breakName: "",
    });
    setIsBellModalOpen(true);
  };

  const handleOpenEditBell = (bell: BellSchedule) => {
    setEditingBell(bell);
    setBellFormData({
      day: bell.day,
      jp: bell.jp,
      timeRange: bell.timeRange,
      durationMinutes: bell.durationMinutes,
      isBreak: bell.isBreak,
      breakName: bell.breakName || "",
    });
    setIsBellModalOpen(true);
  };

  const handleSubmitBell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bellFormData.timeRange.trim()) {
      showToast("Rentang waktu jam belajar wajib diisi.", "error");
      return;
    }

    try {
      setIsSubmittingBell(true);
      const isEdit = !!editingBell;
      const res = await fetch("/api/admin/bell-schedules", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBell?.id,
          day: bellFormData.day,
          jp: Number(bellFormData.jp),
          timeRange: bellFormData.timeRange.trim(),
          durationMinutes: Number(bellFormData.durationMinutes) || 40,
          isBreak: bellFormData.isBreak,
          breakName: bellFormData.isBreak ? bellFormData.breakName : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || (isEdit ? "Jam belajar berhasil diupdate" : "Jam belajar berhasil ditambah"));
        setIsBellModalOpen(false);
        setEditingBell(null);
        loadBellSchedules();
        loadSchedule();
      } else {
        showToast(data.error || "Gagal menyimpan jam belajar.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat menyimpan jam belajar.", "error");
    } finally {
      setIsSubmittingBell(false);
    }
  };

  const handleConfirmDeleteBell = async () => {
    if (!deletingBell) return;
    try {
      setIsSubmittingBell(true);
      const res = await fetch(`/api/admin/bell-schedules?id=${deletingBell.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Jam belajar berhasil dihapus.");
        setDeletingBell(null);
        loadBellSchedules();
        loadSchedule();
      } else {
        showToast(data.error || "Gagal menghapus jam belajar.", "error");
      }
    } catch (err) {
      showToast("Gagal menghapus jam belajar.", "error");
    } finally {
      setIsSubmittingBell(false);
    }
  };

  return {
    isAuthenticated,
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    stats,
    teachersList,
    classroomsList,
    subjectsList,
    selectedDay,
    setSelectedDay,
    selectedClass,
    setSelectedClass,
    schedule,
    loadingSchedule,
    editingSlot,
    setEditingSlot,
    editSubjectId,
    setEditSubjectId,
    editTeacherId,
    setEditTeacherId,
    editRoom,
    setEditRoom,
    editLocked,
    setEditLocked,
    searchQuery,
    setSearchQuery,
    subjectSearchQuery,
    setSubjectSearchQuery,
    toastMessage,
    setToastMessage,
    isTeacherModalOpen,
    setIsTeacherModalOpen,
    editingTeacher,
    teacherFormData,
    setTeacherFormData,
    deletingTeacher,
    setDeletingTeacher,
    isSubmittingTeacher,
    isSubjectModalOpen,
    setIsSubjectModalOpen,
    editingSubject,
    subjectFormData,
    setSubjectFormData,
    deletingSubject,
    setDeletingSubject,
    isSubmittingSubject,
    // Bell Schedules (Hari & Jam)
    bellSchedulesList,
    selectedBellDay,
    setSelectedBellDay,
    loadingBell,
    isBellModalOpen,
    setIsBellModalOpen,
    editingBell,
    bellFormData,
    setBellFormData,
    deletingBell,
    setDeletingBell,
    isSubmittingBell,
    isSolving,
    solverResult,
    days,
    showToast,
    handleLogout,
    loadMasterData,
    loadSchedule,
    loadBellSchedules,
    handleOpenEditSlot,
    handleSaveSlot,
    handleToggleLock,
    handleClearSlot,
    handleRunSolver,
    handleOpenAddTeacher,
    handleOpenEditTeacher,
    handleSubmitTeacher,
    handleConfirmDeleteTeacher,
    handleOpenAddSubject,
    handleOpenEditSubject,
    handleSubmitSubject,
    handleConfirmDeleteSubject,
    handleOpenAddBell,
    handleOpenEditBell,
    handleSubmitBell,
    handleConfirmDeleteBell,
  };
}
