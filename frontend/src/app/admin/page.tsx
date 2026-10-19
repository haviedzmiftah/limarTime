"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminMetricsBar } from "@/components/admin/AdminMetricsBar";
import { ScheduleTab } from "@/components/admin/ScheduleTab";
import { TeachersTab } from "@/components/admin/TeachersTab";
import { SubjectsTab } from "@/components/admin/SubjectsTab";
import { BellTab } from "@/components/admin/BellTab";
import { SolverTab } from "@/components/admin/SolverTab";
import { AdminModals } from "@/components/admin/AdminModals";
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminScheduleCMSPage() {
  const admin = useAdmin();

  // Loading Otentikasi
  if (admin.isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Memverifikasi otentikasi admin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-blue-600/30 overflow-x-hidden">
      {/* 1. SIDEBAR NAVIGASI KIRI */}
      <AdminSidebar
        isSidebarCollapsed={admin.isSidebarCollapsed}
        setIsSidebarCollapsed={admin.setIsSidebarCollapsed}
        isMobileSidebarOpen={admin.isMobileSidebarOpen}
        setIsMobileSidebarOpen={admin.setIsMobileSidebarOpen}
        activeTab={admin.activeTab}
        setActiveTab={admin.setActiveTab}
        teachersCount={admin.teachersList.length}
        subjectsCount={admin.subjectsList.length}
        onLogout={admin.handleLogout}
      />

      {/* 2. AREA KONTEN KANAN */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          admin.isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Header Atas Sticky */}
        <AdminHeader
          activeTab={admin.activeTab}
          onOpenMobileSidebar={() => admin.setIsMobileSidebarOpen(true)}
          onRunSolver={admin.handleRunSolver}
          isSolving={admin.isSolving}
        />

        {/* Konten Utama Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {admin.toastMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between text-sm transition-all duration-300 ${
                admin.toastMessage.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {admin.toastMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{admin.toastMessage.text}</span>
              </div>
              <button
                onClick={() => admin.setToastMessage(null)}
                className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          {admin.stats && <AdminMetricsBar stats={admin.stats} />}

          {/* TAB 1: KELOLA JADWAL */}
          {admin.activeTab === "schedule" && (
            <ScheduleTab
              days={admin.days}
              selectedDay={admin.selectedDay}
              setSelectedDay={admin.setSelectedDay}
              classroomsList={admin.classroomsList}
              selectedClass={admin.selectedClass}
              setSelectedClass={admin.setSelectedClass}
              loadSchedule={admin.loadSchedule}
              loadingSchedule={admin.loadingSchedule}
              schedule={admin.schedule}
              onToggleLock={admin.handleToggleLock}
              onOpenEdit={admin.handleOpenEditSlot}
              onClearSlot={admin.handleClearSlot}
            />
          )}

          {/* TAB 2: DATA GURU (CRUD) */}
          {admin.activeTab === "teachers" && (
            <TeachersTab
              teachersList={admin.teachersList}
              searchQuery={admin.searchQuery}
              setSearchQuery={admin.setSearchQuery}
              onOpenAddTeacher={admin.handleOpenAddTeacher}
              onOpenEditTeacher={admin.handleOpenEditTeacher}
              onConfirmDelete={(teacher) => admin.setDeletingTeacher(teacher)}
            />
          )}

          {/* TAB 3: DATA MATA PELAJARAN (CRUD) */}
          {admin.activeTab === "subjects" && (
            <SubjectsTab
              subjectsList={admin.subjectsList}
              subjectSearchQuery={admin.subjectSearchQuery}
              setSubjectSearchQuery={admin.setSubjectSearchQuery}
              onOpenAddSubject={admin.handleOpenAddSubject}
              onOpenEditSubject={admin.handleOpenEditSubject}
              onConfirmDelete={(subject) => admin.setDeletingSubject(subject)}
            />
          )}

          {/* TAB 4: HARI & JAM BELAJAR (BELL SCHEDULES CRUD) */}
          {admin.activeTab === "bell" && (
            <BellTab
              days={admin.days}
              selectedBellDay={admin.selectedBellDay}
              setSelectedBellDay={admin.setSelectedBellDay}
              bellSchedulesList={admin.bellSchedulesList}
              loadingBell={admin.loadingBell}
              onRefresh={admin.loadBellSchedules}
              onOpenAddBell={admin.handleOpenAddBell}
              onOpenEditBell={admin.handleOpenEditBell}
              onConfirmDelete={(bell) => admin.setDeletingBell(bell)}
            />
          )}

          {/* TAB 5: AUTO SOLVER */}
          {admin.activeTab === "solver" && (
            <SolverTab
              isSolving={admin.isSolving}
              onRunSolver={admin.handleRunSolver}
              solverResult={admin.solverResult}
            />
          )}

          {/* Footer Panel */}
          <div className="pt-8 pb-4 text-center text-xs text-slate-400 border-t border-slate-900">
            <p>© 2026 LimarTime • Panel Kurikulum SMP Negeri 1 Ngawi. All rights reserved.</p>
          </div>
        </main>
      </div>

      {/* 3. DIALOG / MODAL (Edit Slot, Guru CRUD, Mapel CRUD, Bell CRUD) */}
      <AdminModals
        editingSlot={admin.editingSlot}
        setEditingSlot={admin.setEditingSlot}
        selectedClass={admin.selectedClass}
        selectedDay={admin.selectedDay}
        editSubjectId={admin.editSubjectId}
        setEditSubjectId={admin.setEditSubjectId}
        editTeacherId={admin.editTeacherId}
        setEditTeacherId={admin.setEditTeacherId}
        editRoom={admin.editRoom}
        setEditRoom={admin.setEditRoom}
        editLocked={admin.editLocked}
        setEditLocked={admin.setEditLocked}
        onSaveSlot={admin.handleSaveSlot}
        subjectsList={admin.subjectsList}
        teachersList={admin.teachersList}
        isTeacherModalOpen={admin.isTeacherModalOpen}
        setIsTeacherModalOpen={admin.setIsTeacherModalOpen}
        editingTeacher={admin.editingTeacher}
        teacherFormData={admin.teacherFormData}
        setTeacherFormData={admin.setTeacherFormData}
        onSubmitTeacher={admin.handleSubmitTeacher}
        isSubmittingTeacher={admin.isSubmittingTeacher}
        deletingTeacher={admin.deletingTeacher}
        setDeletingTeacher={admin.setDeletingTeacher}
        onConfirmDeleteTeacher={admin.handleConfirmDeleteTeacher}
        isSubjectModalOpen={admin.isSubjectModalOpen}
        setIsSubjectModalOpen={admin.setIsSubjectModalOpen}
        editingSubject={admin.editingSubject}
        subjectFormData={admin.subjectFormData}
        setSubjectFormData={admin.setSubjectFormData}
        onSubmitSubject={admin.handleSubmitSubject}
        isSubmittingSubject={admin.isSubmittingSubject}
        deletingSubject={admin.deletingSubject}
        setDeletingSubject={admin.setDeletingSubject}
        onConfirmDeleteSubject={admin.handleConfirmDeleteSubject}
        days={admin.days}
        isBellModalOpen={admin.isBellModalOpen}
        setIsBellModalOpen={admin.setIsBellModalOpen}
        editingBell={admin.editingBell}
        bellFormData={admin.bellFormData}
        setBellFormData={admin.setBellFormData}
        onSubmitBell={admin.handleSubmitBell}
        isSubmittingBell={admin.isSubmittingBell}
        deletingBell={admin.deletingBell}
        setDeletingBell={admin.setDeletingBell}
        onConfirmDeleteBell={admin.handleConfirmDeleteBell}
      />
    </div>
  );
}
