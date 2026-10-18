# 🚀 Roadmap & Tracker Progres Implementasi: limarTime

Dokumen ini adalah **pelacak progres (Progress Tracker)** resmi untuk memantau status pengerjaan sistem **limarTime (Sistem Penjadwalan SMP Negeri 1 Ngawi)** dari tahap awal hingga produksi.

---

## 📊 Ringkasan Status Progres Keseluruhan

| Indikator | Arti |
| :---: | :--- |
| ⏳ **PENDING** | Belum dimulai |
| 🔄 **IN PROGRESS** | Sedang dalam pengerjaan |
| ✅ **COMPLETED** | Selesai dan terverifikasi |

**Total Progres Proyek**: `100%` *(Seluruh Fase 0 s/d Fase 7 Selesai Penuh)*

```
[████████████████████] 100%
```

---

## 🧭 Rincian Fase & Milestone Pengerjaan

### 📍 Fase 0: Blueprint & Fondasi Arsitektur
> **Fokus**: Penetapan spesifikasi sistem, modeling kendala (constraints), parameter sekolah, dan skema arsitektur.
- [x] Analisis profil sekolah (30 Rombel, 55 Guru, JP Dinamis 40m/30m).
- [x] Pembuatan dokumen acuan [blueprint.md](file:///d:/Web%20Project/limarTime/blueprint.md).
- [x] Penentuan stack teknologi (Next.js, Drizzle ORM, GraphQL Yoga, MySQL/PostgreSQL).
- [x] Penyiapan dataset riil (`smpn1_ngawi_real_data.json`).
- [x] Perancangan tracker progres [ROADMAP.md](file:///d:/Web%20Project/limarTime/ROADMAP.md).
- **Status Fase**: ✅ **COMPLETED**

---

### 📍 Fase 1: Setup Workspace & Modern Frontend Skeleton
> **Fokus**: Inisialisasi framework, arsitektur folder, design system premium, dan navigasi utama.
- [x] Inisialisasi Next.js 16 (App Router, TypeScript, ESLint, Turbopack).
- [x] Penyiapan Core Design System (CSS tokens, dark mode elegan, typography Inter, glassmorphism UI & glowing badges).
- [x] Layout shell & navigasi modular ([Navbar.tsx](file:///d:/Web%20Project/limarTime/src/components/layout/Navbar.tsx) & [Footer.tsx](file:///d:/Web%20Project/limarTime/src/components/layout/Footer.tsx)):
  - Public Portal layout ([page.tsx](file:///d:/Web%20Project/limarTime/src/app/page.tsx))
  - Timetable Matrix view ([matrix/page.tsx](file:///d:/Web%20Project/limarTime/src/app/matrix/page.tsx))
  - GraphQL API docs ([graphql-docs/page.tsx](file:///d:/Web%20Project/limarTime/src/app/graphql-docs/page.tsx))
- [x] Verifikasi build statis & route validation (Zero error, compiled successfully).
- **Status Fase**: ✅ **COMPLETED**

---

### 📍 Fase 2: Database Layer & Drizzle ORM (MySQL / PostgreSQL / Turso-SQLite)
> **Fokus**: Skema relasional database, migrasi otomatis, dan penyediaan master data.
- [x] Konfigurasi Drizzle ORM ([drizzle.config.ts](file:///d:/Web%20Project/limarTime/drizzle.config.ts), [schema.ts](file:///d:/Web%20Project/limarTime/src/db/schema.ts)) siap produksi & fleksibel.
- [x] Definisi entitas tabel relasional:
  - `teachers` (55 guru, NIP, kode unik, batas JP per minggu & hari, unavailable slots)
  - `classrooms` (30 rombel jenjang 7A–9J, grade level)
  - `subjects` (12 mata pelajaran, target JP, split pattern, is morning priority, room type)
  - `teaching_assignments` (SK Penugasan Guru $\leftrightarrow$ Mapel $\leftrightarrow$ Kelas)
  - `bell_schedules` (Struktur 54 slot JP harian, jam masuk, upacara, istirahat, MBG, Jumat 40m/30m)
  - `timetable_slots` (Slot jadwal aktif hasil generate / editing manual dengan conflict flag & versioning)
- [x] Pembuatan dan eksekusi skrip database seeder otomatis ([seed.ts](file:///d:/Web%20Project/limarTime/src/db/seed.ts)) dari data riil `smpn1_ngawi_real_data.json` & `mock_school_data.json`.
- [x] Verifikasi integritas relasi dan unit query database ([test-db.ts](file:///d:/Web%20Project/limarTime/src/db/test-db.ts)):
  - 55 Teachers, 30 Classrooms, 12 Subjects, 54 Bell Schedules, 360 Teaching Assignments (SK).
- **Status Fase**: ✅ **COMPLETED**

---

### 📍 Fase 3: Intelligent Scheduling Solver Engine
> **Fokus**: Algoritma penyusun jadwal otomatis bebas bentrok (*Constraint Satisfaction Problem*).
- [x] Engine validasi aturan baku (*Hard Constraints* - [validator.ts](file:///d:/Web%20Project/limarTime/src/lib/solver/validator.ts)):
  - 0 bentrok guru (1 guru tidak bisa mengajar 2 kelas di jam yang sama).
  - 0 bentrok rombel (1 kelas hanya belajar 1 mapel per JP).
  - Pembagian blok JP proporsional (sesi 2+2 hari berbeda, kontinu tak terputus).
  - Kepatuhan terhadap hari libur/off guru (*Teacher Off-Days*) & kapasitas lab/lapangan.
- [x] Generator otomatis draf jadwal (*Heuristic CSP Engine* - [engine.ts](file:///d:/Web%20Project/limarTime/src/lib/solver/engine.ts)):
  - MRV (Most Constrained Variable First) & Best-fit placement.
  - Kecepatan eksekusi ultra-cepat (~16ms untuk 30 rombel & 55 guru).
- [x] Perhitungan skor optimasi (*Soft Constraints* - [scorer.ts](file:///d:/Web%20Project/limarTime/src/lib/solver/scorer.ts)):
  - Prioritas jam pagi mapel eksakta (Matematika, IPA), minimalisasi jam kosong guru (*gap hours*).
- [x] Multi-version draft management & Database sync ([scheduler-service.ts](file:///d:/Web%20Project/limarTime/src/db/scheduler-service.ts)):
  - API endpoint `/api/solver` & `/api/schedule` terintegrasi langsung dengan database.
- **Status Fase**: ✅ **COMPLETED**

---

### 📍 Fase 4: Interactive Timetable Matrix UI (Drag & Drop)
> **Fokus**: Matriks jadwal interaktif bagi tim kurikulum untuk mengedit dan memodifikasi jadwal secara fleksibel.
- [x] Matrix grid jadwal interaktif (Dual-view: Tampilan Grid per Rombel Kelas & Grid per Tenaga Pendidik / Guru).
- [x] Fitur Drag-and-Drop & Slot Swapping jam mengajar secara visual ([matrix/page.tsx](file:///d:/Web%20Project/limarTime/src/app/matrix/page.tsx)).
- [x] API backend swap slot terintegrasi ([/api/schedule PUT](file:///d:/Web%20Project/limarTime/src/app/api/schedule/route.ts)) dan perlindungan terhadap slot istirahat / locked.
- [x] Real-time visual conflict detector & status indikator (*Zero Conflict Verified*).
- [x] Fitur Undo & Redo stack riwayat perubahan, serta tombol Simpan Perubahan.
- **Status Fase**: ✅ **COMPLETED**

---

### 📍 Fase 5: GraphQL API Server & Integrasi Website Eksternal
> **Fokus**: Penyediaan API terpadu agar jadwal dapat diakses dan ditampilkan di website/portal lain.
- [x] Setup GraphQL Endpoint ([/api/graphql](file:///d:/Web%20Project/limarTime/src/app/api/graphql/route.ts)) berbasis **GraphQL Yoga** dengan CORS terbuka untuk domain publik.
- [x] Implementasi GraphQL Resolvers berbasis Drizzle ORM ([schema.ts](file:///d:/Web%20Project/limarTime/src/lib/graphql/schema.ts)):
  - `schoolInfo`: metadata sekolah, SK, semester
  - `classes(grade)`: daftar 30 rombel kelas
  - `teachers(query)`: daftar 55 tenaga pendidik & kode inisial
  - `subjects`: daftar 12 mata pelajaran kurikulum
  - `schedule(className, teacherCode, day, versionId)`: jadwal mengajar terstruktur
  - `bellSchedule(day)`: struktur JP, jam masuk & durasi
- [x] In-Browser Interactive GraphQL Explorer di halaman [/graphql-docs](file:///d:/Web%20Project/limarTime/src/app/graphql-docs/page.tsx) (live query execution & response viewer).
- [x] Web Widget Embed Code ([public/widget.js](file:///d:/Web%20Project/limarTime/public/widget.js)): snippet JavaScript siap pakai untuk ditempel di portal/website eksternal.
- **Status Fase**: ✅ **COMPLETED**

---

### 📍 Fase 6: Cetak Dokumen Resmi & Ekspor Laporan
> **Fokus**: Pencetakan dokumen administratif siap arsip dan distribusi.
- [x] Export PDF / Cetak Kartu Jadwal Guru (55 berkas/halaman siap cetak per nama guru dengan NIP & pengesahan kepala sekolah di [/export](file:///d:/Web%20Project/limarTime/src/app/export/page.tsx)).
- [x] Export PDF / Cetak Jadwal Dinding Kelas (30 lembar resmi untuk ditempel di ruang kelas 7A–9J).
- [x] Export Jadwal Induk Sekolah (*Master Timetable Matrix*) format Excel (.xlsx) via endpoint [/api/export/excel](file:///d:/Web%20Project/limarTime/src/app/api/export/excel/route.ts) dan layout cetak A3/F4.
- **Status Fase**: ✅ **COMPLETED**

---

### 📍 Fase 7: Mobile Public Timetable Viewer & Deployment
> **Fokus**: Tampilan portal jadwal publik yang ramah pengguna smartphone siswa dan wali murid.
- [x] Halaman jadwal publik mobile-first yang cepat, ringan, tanpa perlu login ([page.tsx](file:///d:/Web%20Project/limarTime/src/app/page.tsx)).
- [x] Filter pencarian instan berdasarkan 30 rombel kelas (7A–9J) dan 55 guru (dengan kode inisial & mapel).
- [x] Dukungan PWA & Web App Manifest ([public/manifest.json](file:///d:/Web%20Project/limarTime/public/manifest.json)) untuk pengalaman native di smartphone.
- [x] Verifikasi build produksi Turbopack Next.js 16 (*Zero Error, Clean Deployment Ready*).
- **Status Fase**: ✅ **COMPLETED**

---

### 📍 Fase 8: CMS Kurikulum & Manajemen Jadwal Admin
> **Fokus**: Panel administratif interaktif untuk mengelola slot, mengunci jadwal, inspeksi beban guru, dan kontrol AI solver.
- [x] Portal CMS Admin terpusat di [/admin](file:///d:/Web%20Project/limarTime/src/app/admin/page.tsx).
- [x] API Admin Pengelola Slot Jadwal ([/api/admin/schedule-slots](file:///d:/Web%20Project/limarTime/src/app/api/admin/schedule-slots/route.ts)) mendukung Update JP, Toggle Lock/Unlock, dan Reset/Hapus Slot.
- [x] API Master Data & Dashboard Metrik Kurikulum ([/api/admin/master-data](file:///d:/Web%20Project/limarTime/src/app/api/admin/master-data/route.ts)) untuk 55 Guru, 30 Rombel, 12 Mapel, dan ribuan slot.
- [x] Antarmuka manajemen guru, pencarian instan, dan inspeksi batas beban JP (maks JP/minggu & maks JP/hari).
- [x] Integrasi langsung dengan Algoritma Solver Jadwal Otomatis dengan proteksi slot terkunci.
- **Status Fase**: ✅ **COMPLETED**

---

## 📌 Catatan & Log Pembaruan
* **2026-10-18**:
  * Modul **CMS Admin Pengelola Jadwal** selesai diimplementasikan di route [/admin](file:///d:/Web%20Project/limarTime/src/app/admin/page.tsx) lengkap dengan CRUD slot pembelajaran, toggle lock/unlock, tab data 55 guru & mapel, serta eksekusi auto-solver.
* **2026-10-14**:
  * Blueprint arsitektur diperbarui dengan spesifikasi **Drizzle ORM** (MySQL/PostgreSQL) dan **GraphQL API**.
  * File tracking [ROADMAP.md](file:///d:/Web%20Project/limarTime/ROADMAP.md) resmi dibuat untuk melacak tahapan implementasi.
