# 🏛️ limarTime Standalone Backend API

Backend API Server independen untuk **limarTime (Sistem Penjadwalan SMP Negeri 1 Ngawi)** berbasis **Hono Framework** + **Node.js** + **Drizzle ORM**.

---

## 📂 Struktur Direktori

```
backend/
├── src/
│   ├── db/                 # Koneksi database Drizzle, Schema, & Scheduler Service
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── scheduler-service.ts
│   ├── routes/             # Endpoint modul API
│   │   ├── schedule.ts     # GET /api/schedule, PUT /api/schedule (Swap)
│   │   ├── adminSlots.ts   # CRUD /api/admin/schedule-slots
│   │   ├── masterData.ts   # GET /api/admin/master-data
│   │   ├── solver.ts       # GET & POST /api/solver/run
│   │   └── teachers.ts     # GET /api/teachers
│   ├── solver/             # Algoritma Constraint Satisfaction (Engine, Rules, Validator)
│   └── index.ts            # Entrypoint Hono Server (Port 4000)
├── local.db                # Database SQLite lokal (jika mode lokal)
├── package.json
└── tsconfig.json
```

---

## 🚀 Menjalankan Server Backend

Dari folder root proyek:
```bash
npm run dev:backend
```

Atau masuk ke direktori `backend/`:
```bash
cd backend
npm run dev
```

Server backend akan berjalan di **`http://localhost:4000`**.

---

## 📡 Daftar Endpoint Utama

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check status server |
| `GET` | `/api/schedule` | Query jadwal per kelas atau per guru |
| `PUT` | `/api/schedule` | Swap dua slot jadwal yang dipilih |
| `GET` | `/api/admin/master-data` | Statistik total guru, rombel, slot, & data master |
| `GET` | `/api/admin/schedule-slots` | Ambil slot aktif per kelas dan hari |
| `POST` | `/api/admin/schedule-slots` | Buat atau perbarui slot jadwal |
| `PATCH`| `/api/admin/schedule-slots` | Kunci (*Lock/Unlock*) slot tertentu |
| `DELETE`| `/api/admin/schedule-slots`| Kosongkan/reset slot tertentu |
| `POST` | `/api/solver/run` | Jalankan algoritma auto-solver penyusunan jadwal |
| `GET` | `/api/teachers` | Ambil daftar 55 guru dan kode inisial |
