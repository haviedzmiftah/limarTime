# 🚀 Roadmap & Tracker Progres Implementasi: limarTime

Dokumen ini adalah **pelacak progres (Progress Tracker)** resmi untuk memantau status pengerjaan sistem **limarTime (Sistem Penjadwalan SMP Negeri 1 Ngawi)** dari tahap awal hingga produksi.

---

## 📊 Ringkasan Status Progres Keseluruhan

| Indikator | Arti |
| :---: | :--- |
| ⏳ **PENDING** | Belum dimulai |
| 🔄 **IN PROGRESS** | Sedang dalam pengerjaan |
| ✅ **COMPLETED** | Selesai dan terverifikasi |

**Total Progres Proyek**: `25%` *(Fase 0 & Fase 1 Selesai)*

```
[█████░░░░░░░░░░░░░░░] 25%
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

### 📍 Fase 2: Database Layer & Drizzle ORM (MySQL / PostgreSQL)
> **Fokus**: Skema relasional database, migrasi otomatis, dan penyediaan master data.
- [ ] Konfigurasi Drizzle ORM (`drizzle.config.ts`, `schema.ts`) mendukung MySQL & PostgreSQL.
- [ ] Definisi entitas tabel:
  - `teachers` (55 guru, NIP, kode 2-huruf, batas beban mengajar)
  - `classes` (30 rombel jenjang 7A–9J)
  - `subjects` (Mata pelajaran umum & penugasan lab/ruang)
  - `teaching_assignments` (SK Penugasan Guru $\leftrightarrow$ Mapel $\leftrightarrow$ Kelas)
  - `bell_schedules` (Struktur JP harian, jam masuk, durasi normal 40m vs Jumat/Ramadhan 30m)
  - `timetable_slots` (Slot jadwal aktif hasil generate / editing manual)
- [ ] Pembuatan skrip database seeder otomatis menggunakan data `smpn1_ngawi_real_data.json`.
- [ ] Verifikasi integritas relasi dan unit query database.
- **Status Fase**: ⏳ **PENDING**

---

### 📍 Fase 3: Intelligent Scheduling Solver Engine
> **Fokus**: Algoritma penyusun jadwal otomatis bebas bentrok (*Constraint Satisfaction Problem*).
- [ ] Engine validasi aturan baku (*Hard Constraints*):
  - 0 bentrok guru (1 guru tidak bisa mengajar 2 kelas di jam yang sama).
  - 0 bentrok rombel (1 kelas hanya belajar 1 mapel per JP).
  - Pembagian blok JP proporsional (misal: 4 JP dibagi menjadi sesi 2+2).
  - Kepatuhan terhadap hari libur/off guru (*Teacher Off-Days*).
- [ ] Generator otomatis draf jadwal (*Heuristic / Backtracking Constraint Solver*).
- [ ] Perhitungan skor optimasi (*Soft Constraints*: distribusi merata, jeda kosong minimal).
- [ ] Multi-version draft management (*Draft v1, Draft v2, Official Final*).
- **Status Fase**: ⏳ **PENDING**

---

### 📍 Fase 4: Interactive Timetable Matrix UI (Drag & Drop)
> **Fokus**: Matriks jadwal interaktif bagi tim kurikulum untuk mengedit dan memodifikasi jadwal secara fleksibel.
- [ ] Matrix grid jadwal interaktif (Dual-view: Tampilan Grid per Kelas & Grid per Guru).
- [ ] Fitur Drag-and-Drop & Slot Swapping jam mengajar.
- [ ] Real-time visual conflict detector (highlight merah instan jika terjadi bentrok saat memindahkan slot).
- [ ] Fitur Undo/Redo dan tombol simpan perubahan.
- **Status Fase**: ⏳ **PENDING**

---

### 📍 Fase 5: GraphQL API Server & Integrasi Website Eksternal
> **Fokus**: Penyediaan API terpadu agar jadwal dapat diakses dan ditampilkan di website/portal lain.
- [ ] Setup GraphQL Endpoint (`/api/graphql`) dengan CORS terbuka untuk domain publik.
- [ ] Implementasi GraphQL Resolver berbasis Drizzle ORM:
  - `classes(grade)`: query daftar kelas & jadwal
  - `teachers(query)`: query daftar guru & jadwal mengajar mingguan
  - `schedule(className, teacherCode, day)`: query jadwal belajar-mengajar
  - `bellSchedule(day)`: query struktur jam & durasi JP
- [ ] Interactive GraphQL Explorer / Playground (in-browser testing).
- [ ] Penyediaan Web Widget / Embed Code (JavaScript snippet siap pakai untuk ditempel di website eksternal).
- **Status Fase**: ⏳ **PENDING**

---

### 📍 Fase 6: Cetak Dokumen Resmi & Ekspor Laporan
> **Fokus**: Pencetakan dokumen administratif siap arsip dan distribusi.
- [ ] Export PDF Kartu Jadwal Guru (55 berkas/halaman siap cetak per nama guru).
- [ ] Export PDF Jadwal Dinding Kelas (30 lembar untuk ditempel di ruang kelas 7A–9J).
- [ ] Export Jadwal Induk Sekolah (*Master Timetable Matrix*) format Excel (.xlsx) dan PDF A3/F4.
- **Status Fase**: ⏳ **PENDING**

---

### 📍 Fase 7: Mobile Public Timetable Viewer & Deployment
> **Fokus**: Tampilan portal jadwal publik yang ramah pengguna smartphone siswa dan wali murid.
- [ ] Halaman jadwal publik yang cepat, ringan, tanpa perlu login.
- [ ] Filter pencarian instan berdasarkan rombel atau nama guru.
- [ ] PWA / Mobile friendly caching agar jadwal bisa diakses cepat saat koneksi lambat.
- [ ] Finalisasi pengujian end-to-end, keamanan, dan deployment.
- **Status Fase**: ⏳ **PENDING**

---

## 📌 Catatan & Log Pembaruan
* **2026-10-14**:
  * Blueprint arsitektur diperbarui dengan spesifikasi **Drizzle ORM** (MySQL/PostgreSQL) dan **GraphQL API**.
  * File tracking [ROADMAP.md](file:///d:/Web%20Project/limarTime/ROADMAP.md) resmi dibuat untuk melacak tahapan implementasi.
