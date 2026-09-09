# Project Management

---

## 1. Ringkasan & Tujuan Aplikasi

- **Nama Aplikasi**: Project Management
- **Penjelasan Singkat**: Project Management adalah aplikasi web internal untuk mengelola, mendokumentasikan, dan menginventarisir proyek pembuatan software secara rapi di satu tempat, mulai dari daftar klien, detail teknis proyek, jaminan tim, catatan dokumentasi, hingga jejak aktivitas perubahan data.
- **Masalah yang Diselesaikan**: Data proyek sering tersebar di spreadsheet, chat, atau catatan pribadi sehingga sulit dicari kembali; detail teknis seperti tech stack, kredensial, dan repository tidak terdokumentasi secara konsisten; pemilik bisnis kesulitan memantau status seluruh proyek yang sedang dikerjakan tim; dan tidak ada jejak audit ketika data proyek diubah oleh siapa pun.
- **Pengguna Aplikasi**: Admin/Pemilik usaha yang ingin menginventarisir seluruh proyek; Anggota tim developer yang mengerjakan proyek; dan Klien yang datanya dicatat sebagai master data klien tanpa perlu memiliki akun login.
- **Target Keberhasilan**: Seluruh data proyek software terdokumentasi lengkap di satu aplikasi; pencarian proyek berdasarkan nama, klien, status, dan tech stack menjadi cepat; setiap perubahan data proyek tercatat dalam log aktivitas; dan kolaborasi antar anggota tim berjalan lebih teratur melalui penugasan anggota dan catatan proyek.

---

## 2. Batasan Pembuatan Sistem (Versi Awal MVP)

### ✅ Yang Dikerjakan:
- Autentikasi pengguna internal menggunakan email dan password melalui Clerk.
- Dashboard ringkasan berisi jumlah proyek, status proyek, jumlah klien, jumlah anggota, proyek terbaru, dan aktivitas terbaru.
- Daftar proyek lengkap dengan fitur pencarian dan filter berdasarkan status, klien, dan tech stack.
- Detail proyek berisi nama proyek, klien, status, tech stack (frontend, backend, database), kredensial (username & password), dan repository.
- Form tambah dan edit proyek dengan validasi data.
- Master data klien terpisah yang dapat dipilih saat membuat proyek.
- Daftar status proyek tetap yang telah ditentukan sistem, tetapi tetap fleksibel untuk dikembangkan.
- Manajemen tim dan anggota proyek, termasuk penugasan beberapa anggota ke sebuah proyek.
- Catatan dan dokumentasi proyek yang dapat ditambahkan oleh anggota tim.
- Fitur log aktivitas yang mencatat setiap perubahan data proyek, status, anggota, dan catatan.
- Desain UI/UX modern dan responsif menggunakan Tailwind CSS serta komponen shadcn/ui.
- Integrasi Read-Only GitHub API untuk mengambil dan menampilkan status repository (default branch, visibilitas publik/privat, stars, open issues) serta riwayat commit terbaru pada detail proyek.

### ⛔ Yang Tidak Dikerjakan di Versi Awal:
- Tidak ada pembayaran, invoice, atau manajemen anggaran proyek.
- Tidak ada role khusus "klien login" atau portal berbagi dokumen untuk klien.
- Tidak ada fitur time tracking, timesheet, atau penghitungan durasi pengerjaan.
- Tidak ada notifikasi email atau WhatsApp otomatis untuk aktivitas proyek.
- Tidak ada fitur impor data dari spreadsheet dalam jumlah besar.
- Tidak ada aplikasi mobile native terpisah, aplikasi hanya dibuat responsif untuk perangkat mobile.

---

## 3. Daftar Halaman & Struktur Menu (Pages & Routing)

### A. Public Area (Tanpa Login)
- `/`: Beranda publik yang menjelasakan fitur aplikasi, tampilan produk, dan tombol menuju halaman masuk.
- `/sign-in`: Halaman masuk pengguna menggunakan email dan password via Clerk.
- `/sign-up`: Halaman pendaftaran pengguna baru via Clerk, digunakan khusus pengguna tim yang diundang.

### B. Member/User Area (Setelah Login)
- `/dashboard`: Dasbor utama berisi ringkasan statistik, daftar proyek terbaru, dan aktivitas terbaru.
- `/projects`: Halaman daftar seluruh proyek dengan fitur pencarian dan filter.
- `/projects/new`: Form tambah proyek baru.
- `/projects/[projectId]`: Halaman detail proyek yang berisi ringkasan, anggota tim, catatan, dan log aktivitas proyek.
- `/projects/[projectId]/edit`: Form edit data proyek.
- `/clients`: Halaman daftar master data klien.
- `/clients/new`: Form tambah data klien baru.
- `/clients/[clientId]/edit`: Form edit data klien.
- `/team`: Halaman manajemen anggota tim dan undangan pengguna (khusus Admin).

---

## 4. Pedoman UI/UX & Design System

- **Skema Warna**: Primary: HSL(217, 91%, 60%), Primary Foreground: HSL(0, 0%, 100%), Background: HSL(0, 0%, 100%), Muted/Secondary: HSL(220, 14%, 96%), Border: HSL(220, 13%, 88%), Accent: HSL(262, 83%, 58%), Sukses: HSL(142, 71%, 45%), Danger: HSL(0, 72%, 51%), Warning: HSL(38, 92%, 50%).
- **Tipografi**: Heading dan body menggunakan font "Inter" yang dimuat melalui next/font; teks kode, kredensial, dan URL repository menggunakan font monospace "JetBrains Mono" agar mudah dibedakan.
- **Aturan Komponen**: Kartu menggunakan sudut membulat `rounded-xl`, border `border-slate-200`, dan shadow halus (`shadow-sm`); tombol utama menggunakan rounded penuh (`rounded-lg`) dan efek interaktif; tabel menggunakan desain sederhana dengan baris bergaris tipis.
- **Nuansa & Vibe**: Desain bersih, profesional, modern, banyak ruang putih, dengan aksen warna biru dan ungu untuk elemen aktif; animasi halus saat buka menu, simpan data, dan transisi halaman; seluruh halaman dashboard dan halaman proyek konsisten menggunakan layout sidebar.
- **Tampilan Perangkat**: Pada layar desktop, layout menggunakan sidebar tetap di kiri; pada layar mobile, sidebar berubah menjadi menu kanvas (drawer) yang dapat dibuka dari tombol hamburger di header.

---

## 5. Pembagian Hak Akses Pengguna

| Menu / Halaman | Publik (Tanpa Login) | Member / Anggota Tim | Admin / Pemilik |
| :--- | :---: | :---: | :---: |
| Halaman Beranda Publik | ✅ | ✅ | ✅ |
| Halaman Sign-In dan Sign-Up | ✅ | ❌ | ❌ |
| Dashboard | ❌ | ✅ | ✅ |
| Daftar Proyek dan Detail Proyek | ❌ | ✅ | ✅ |
| Tambah dan Edit Proyek | ❌ | ✅ | ✅ |
| Hapus Proyek | ❌ | ❌ | ✅ |
| Kelola Master Data Klien | ❌ | ❌ | ✅ |
| Lihat Data Klien saat memilih proyek | ❌ | ✅ | ✅ |
| Kelola Anggota Proyek | ❌ | ✅ | ✅ |
| Kelola Anggota Tim / Undangan Akun | ❌ | ❌ | ✅ |
| Tambah, Edit, Hapus Catatan Proyek | ❌ | ✅ | ✅ |
| Lihat Log Aktivitas Proyek | ❌ | ✅ | ✅ |
| Akses Halaman Pengaturan Teknis Aplikasi | ❌ | ❌ | ✅ |

---

## 6. Alur Kerja dan Fitur Utama

### A. Autentikasi Pengguna dan Peran
1. **Cara Kerja**: Pengguna baru diundang oleh Admin melalui email. Undangan tersebut dikirim lewat Clerk sehingga pengguna dapat mendaftar menggunakan email dan password. Saat pengguna pertama kali masuk, data akun Clerk otomatis disinkronkan ke database aplikasi melalui webhook. Akun dengan alamat email yang terdaftar di variabel lingkungan `INITIAL_ADMIN_EMAIL` akan otomatis memiliki peran Admin.
2. **Aturan Sistem**: Hanya pengguna yang sudah login yang dapat mengakses halaman dashboard dan daftar proyek; halaman kelola tim dan hapus proyek hanya dapat diakses oleh Admin; route akan otomatis diarahkan ke `/sign-in` jika pengguna belum login dan mencoba membuka halaman khusus member.

### B. Dashboard
1. **Cara Kerja**: Setelah login, pengguna langsung melihat empat kartu statistik utama: total proyek, proyek yang sedang berjalan, jumlah klien, dan jumlah anggota tim. Di bawahnya terdapat daftar lima proyek terbaru dan daftar lima aktivitas terbaru dari seluruh proyek.
2. **Aturan Sistem**: Data statistik dihitung dari database secara real-time; setiap kali ada proyek baru, status berubah, atau catatan ditambahkan, aktivitas tersebut ikut muncul di dasbor; klik pada salah satu proyek akan mengarahkan ke halaman detail proyek.

### C. Pencarian dan Filter Proyek
1. **Cara Kerja**: Pada halaman `/projects`, pengguna dapat mengetikkan kata kunci pada kotak pencarian. Sistem akan mencari berdasarkan nama proyek, nama klien, nama perusahaan klien, atau repository. Pengguna juga dapat memilih filter status, filter klien, dan memilih filter frontend/backend/database dari panel filter.
2. **Aturan Sistem**: Pencarian dan filter dapat digunakan bersamaan; tombol "Reset" akan mengosongkan seluruh filter; hasil pencarian ringkas dan daftar proyek diperbarui tanpa memuat ulang halaman.

### D. Tambah dan Edit Proyek
1. **Cara Kerja**: Pengguna membuka halaman `/projects/new` atau menekan tombol "Tambah Proyek". Form menampilkan kolom Nama Proyek, Klien (drop-down dari master data klien), Status (drop-down daftar tetap), Deskripsi, Frontend Tech, Backend Tech, Database Tech, Repository, Username Kredensial, dan Password Kredensial. Saat disimpan, sistem menyimpan data dan membuat log aktivitas "PROJECT_CREATED".
2. **Aturan Sistem**: Nama proyek wajib diisi minimal 3 karakter; klien wajib dipilih; status wajib dipilih; password kredensial akan dienkripsi sebelum disimpan ke database dan tidak akan pernah ditampilkan sebagai teks terbuka di log; pada halaman edit, semua perubahan dibandingkan dan dicatat sebagai "PROJECT_UPDATED".

### E. Detail Proyek
1. **Cara Kerja**: Halaman `/projects/[projectId]` menampilkan informasi lengkap proyek. Bagian utama menampilkan kartu profil proyek berisi nama proyek, klien, status, tech stack, kredensial, dan widget integrasi GitHub yang menampilkan URL repository, default branch, status visibilitas (publik/privat), jumlah stars/open issues, serta commit terbaru (author, pesan commit, dan waktu commit). Di bawahnya terdapat tab "Anggota Tim", "Catatan", dan "Aktivitas" untuk membuka modul terkait.
2. **Aturan Sistem**: Status proyek ditampilkan dengan label dan warna berbeda; tombol "Salin Repository" menyalin URL repository ke clipboard; integrasi GitHub berjalan secara server-side melalui token `GITHUB_TOKEN` (dengan fallback rate-limit publik) dan dicache dengan revalidasi berkala (5-10 menit) untuk menjaga kuota rate limit; tombol mata pada kredensial berfungsi menampilkan atau menyembunyikan password yang telah didekripsi khusus untuk pengguna yang berwenang.

### F. Master Data Klien
1. **Cara Kerja**: Admin membuka menu "Klien" untuk melihat seluruh daftar klien dalam bentuk tabel. Admin dapat menekan tombol "Tambah Klien" untuk membuat data klien baru, atau memilih edit pada baris klien untuk memperbarui data.
2. **Aturan Sistem**: Field yang wajib diisi adalah Nama Klien, sedangkan kolom lainnya opsional; ketika data klien sudah dipakai oleh proyek, klien tidak dapat dihapus permanen oleh sistem; Admin harus memindahkan atau mengganti klien proyek terlebih dahulu sebelum klien dapat dihapus.

### G. Manajemen Tim dan Anggota Proyek
1. **Cara Kerja**: Admin membuka halaman `/team` untuk melihat daftar seluruh anggota tim yang sudah terdaftar. Admin dapat mengubah peran anggota dari "Member" menjadi "Admin" atau sebaliknya. Dari halaman detail sebuah proyek, pengguna yang memiliki akses dapat menambahkan anggota tim ke proyek melalui modal "Tambah Anggota" dan memilih peran khusus seperti Project Manager, Frontend, Backend, Fullstack, Designer, atau QA.
2. **Aturan Sistem**: Satu proyek dapat memiliki banyak anggota; satu anggota dapat dikaitkan ke banyak proyek; saat menambah atau menghapus anggota proyek, sistem mencatat log "MEMBER_ADDED" atau "MEMBER_REMOVED"; daftar pilihan anggota hanya akan menampilkan akun yang sudah disinkronkan ke database aplikasi.

### H. Catatan dan Dokumentasi Proyek
1. **Cara Kerja**: Pada tab "Catatan" di halaman detail proyek, pengguna dapat menulis catatan baru berisi dokumentasi, keputusan, atau progres pengerjaan. Catatan dapat disematkan sehingga muncul di urutan teratas dan dapat diedit atau dihapus oleh penulisnya.
2. **Aturan Sistem**: Isi catatan wajib diisi minimal 5 karakter; setiap pembuatan, penyuntingan, dan penghapusan catatan dicatat ke dalam log aktivitas; Admin dapat menghapus semua catatan, sedangkan Member hanya dapat menghapus catatan yang dibuatnya sendiri.

### I. Log Aktivitas Perubahan Data Proyek
1. **Cara Kerja**: Setiap kali terjadi perubahan data proyek, sistem secara otomatis mencatat aktivitas ke dalam tabel `activity_logs`. Log menampilkan siapa yang melakukan aksi, jenis aksi, waktu kejadian, dan detail perubahan seperti "Nama Proyek diubah dari 'Aplikasi Toko' menjadi 'Aplikasi Toko Online'".
2. **Aturan Sistem**: Log tidak pernah menampilkan nilai password kredensial; perubahan status dicatat dengan aksi khusus "PROJECT_STATUS_CHANGED"; log aktivitas terbaru muncul pertama kali; log dapat dilihat pada tab "Aktivitas" di detail proyek dan di dasbor.

---

## 7. Alur Navigasi & Arsitektur Layout

### Arsitektur Layout (Persisten)
- **Public Layout**: Halaman publik menggunakan Header/Navbar yang menempel di bagian atas dan Footer di bagian bawah.
- **Dashboard Layout**: Halaman setelah login menggunakan Sidebar di kiri secara tetap, Header kecil di atas, dan konten utama memenuhi sisa area layar.

### Bagan Alur (Flowchart)
```mermaid
flowchart TD
    A[Pengunjung] --> B[Landing Page /]
    B --> C[Sign-In Clerk]
    C --> D[Dashboard]
    D --> E[Menu Projek]
    D --> F[Menu Klien]
    D --> G[Menu Tim]
    E --> H[Form Tambah Proyek]
    E --> I[Detail Proyek]
    I --> J[Edit Proyek]
    I --> K[Tab Anggota Tim]
    I --> L[Tab Catatan]
    I --> M[Tab Aktivitas]
    F --> N[Form Tambah/Edit Klien]
    G --> O[Modal Undang Anggota]
    H --> P[Simpan Project]
    J --> P
    P --> Q[Log Aktivitas Tercipta]
    Q --> E
```

---

## 8. Kebutuhan Non-Fungsional (SEO, Keamanan, & Performa)

- **SEO**: Halaman publik `/` wajib memiliki tag `<title>`, meta description, dan Open Graph tags dinamis melalui fungsi `generateMetadata`; halaman authenticated seperti dashboard dan halaman proyek harus memiliki meta `robots: noindex` agar tidak muncul di mesin pencari.
- **Keamanan**: Semua form pada aplikasi wajib divalidasi di sisi klien maupun sisi server menggunakan Zod; input pengguna disanitiasi untuk mencegah XSS; seluruh operasi pada data proyek wajib memakai Server Actions sehingga proteksi CSRF dapat dimaksimalkan oleh Next.js; autentikasi dan manajemen sesi memakai Clerk; kredensial password proyek dienkripsi terlebih dahulu sebelum disimpan menggunakan algoritma AES-256-GCM dan kunci dari environment variable.
- **Performa**: Pencarian proyek menggunakan query database yang dioptimalkan dengan index pada kolom `name`, `client_id`, dan `status`; penggunaan komponen `<Image>` dari Next.js untuk seluruh gambar; penggunaan React Suspense untuk daftar proyek dan aktivitas agar tampilan halaman tidak menunggu seluruh data; data master yang jarang berubah seperti daftar klien dan anggota disimpan dalam cache dengan strategy `revalidate` yang sesuai.

---

## 9. Panduan Bahasa, Copywriting, & Data Dummy

- **Gaya Bahasa**: Menggunakan Bahasa Indonesia profesional, ramah, dan membumi; kata sapaan menggunakan "Anda" dan "Kami"; seluruh label menu, tombol, dan pesan kesalahan menggunakan Bahasa Indonesia yang ringkas dan jelas.
- **Instruksi Data Dummy**: JANGAN PERNAH MENGGUNAKAN "Lorem Ipsum". Seluruh data contoh wajib menggunakan Bahasa Indonesia dan relevan dengan konteks aplikasi manajemen proyek software.
- **Contoh Data Data Dummy**:
  - Nama Proyek: "Sistem Informasi Desa (SI-Desa)"
  - Klien: "Pemerintah Desa Sukamaju"
  - Status: "Berjalan"
  - Frontend: "Next.js, TypeScript, Tailwind CSS"
  - Backend: "NestJS, REST API"
  - Database: "PostgreSQL"
  - Repository: "https://github.com/eduwbemu/si-desa"
  - Username Kredensial: "admin_sidesa"
  - Password Kredensial disimpan sebagai data terenkripsi dan tidak ditulis sebagai teks biasa di dokumen teknis.
  - Catatan: "Menunggu revisi modul laporan keuangan dari pihak desa."

---

## 10. Fondasi Teknis (Untuk Tim Pengembang / Programmer & AI)

- **Bahasa & Framework**: Next.js 15 dengan App Router.
- **Tampilan Antarmuka (UI)**: Tailwind CSS, komponen shadcn/ui, dan icon library Lucide React.
- **Autentikasi**: Clerk Authentication dengan metode Email & Password.
- **Basis Data**: Neon PostgreSQL dengan Drizzle ORM.
- **Media / Aset Statis**: Bunny CDN digunakan untuk melayani aset statis publik seperti avatar, logo, dan gambar ilustrasi agar loading lebih cepat.
- **Manajemen Kode**: Git, GitHub, dan environment variable untuk seluruh konfigurasi rahasia.
- **Integrasi Eksternal**: GitHub REST API (Read-Only) menggunakan native fetch / Octokit dengan Bearer token server-side (`GITHUB_TOKEN`) dan caching revalidate berkala.
- **Tooling**: TypeScript, ESLint, Prettier, dan pnpm sebagai package manager.

### Struktur Skema Database Nyata

```typescript
// lib/db/schema.ts
import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
]);

export const memberRoleEnum = pgEnum("member_role", ["admin", "member"]);

export const projectMemberRoleEnum = pgEnum("project_member_role", [
  "project_manager",
  "frontend",
  "backend",
  "fullstack",
  "designer",
  "qa",
  "other",
]);

export const activityActionEnum = pgEnum("activity_action", [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_STATUS_CHANGED",
  "PROJECT_DELETED",
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  "NOTE_CREATED",
  "NOTE_UPDATED",
  "NOTE_DELETED",
]);

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    avatarUrl: text("avatar_url"),
    role: memberRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("members_clerk_id_idx").on(table.clerkId)]
);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    status: projectStatusEnum("status").notNull().default("planning"),
    frontendTech: text("frontend_tech"),
    backendTech: text("backend_tech"),
    databaseTech: text("database_tech"),
    repositoryUrl: text("repository_url"),
    credentialUsername: text("credential_username"),
    credentialPassword: text("credential_password"),
    credentialIv: text("credential_iv"),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("projects_name_idx").on(table.name),
    index("projects_client_id_idx").on(table.clientId),
    index("projects_status_idx").on(table.status),
  ]
);

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    role: projectMemberRoleEnum("role").notNull().default("other"),
    assignedBy: uuid("assigned_by").references(() => members.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.memberId] }),
    index("project_members_member_idx").on(table.memberId),
  ]
);

export const projectNotes = pgTable(
  "project_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("project_notes_project_idx").on(table.projectId)]
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: text("project_id").notNull(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    action: activityActionEnum("action").notNull(),
    entityType: text("entity_type").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("activity_logs_project_idx").on(table.projectId),
    index("activity_logs_created_at_idx").on(table.createdAt),
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  createdBy: one(members, {
    fields: [projects.createdById],
    references: [members.id],
  }),
  projectMembers: many(projectMembers),
  notes: many(projectNotes),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  member: one(members, {
    fields: [projectMembers.memberId],
    references: [members.id],
  }),
}));

export const projectNotesRelations = relations(projectNotes, ({ one }) => ({
  project: one(projects, {
    fields: [projectNotes.projectId],
    references: [projects.id],
  }),
  author: one(members, {
    fields: [projectNotes.authorId],
    references: [members.id],
  }),
}));
```

### Variabel Lingkungan (`.env.example`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
INITIAL_ADMIN_EMAIL=admin@projectku.id

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require

# Enkripsi Kredensial Password Proyek
# Harus berisi 32 karakter acak yang sama untuk production
CREDENTIAL_ENCRYPTION_KEY=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08

# Bunny CDN (opsional untuk aset statis avatar/logo)
NEXT_PUBLIC_CDN_URL=
BUNNY_API_KEY=
BUNNY_STORAGE_ZONE=

# GitHub Integration (Read-Only)
GITHUB_TOKEN=
```

---

## 11. Tahapan Pengerjaan & Task Breakdown (Actionable Work Breakdown Structure)

### Tahap 1: Fondasi Proyek, UI/UX, & Semua Halaman (Dummy Data)
*Tujuan: Membangun seluruh antarmuka visual secara lengkap dan responsif menggunakan data dummy sebelum menyentuh database.*

- [ ] **Task 1.1 (Foundations & Design System)**: Setup proyek Next.js 15 App Router dengan TypeScript, Tailwind CSS, shadcn/ui, font Inter, font JetBrains Mono, library icon Lucide, dan konfigurasi tema warna sesuai PRD ini.
- [ ] **Task 1.2 (Layouts & Persistent Navigation)**: Buat Public Layout dengan Header dan Footer, Dashboard Layout dengan Sidebar berisi menu Dashboard, Proyek, Klien, Tim beserta tombol keluar; pastikan sidebar responsif menjadi mobile drawer.
- [ ] **Task 1.3 (Mock Data & Data Layer Sementara)**: Buat file mock data TypeScript berisi data proyek, klien, anggota tim, catatan, dan log aktivitas yang menggunakan Bahasa Indonesia sesuai Bab 9; seluruh halaman pada Fase 1 menggunakan data ini.
- [ ] **Task 1.4 (Halaman Publik & Authentication Readiness)**: Buat halaman `/` berisi hero, penjelasan fitur, dan CTA menuju `/sign-in`; siapkan halaman `/sign-in` dan `/sign-up` menggunakan komponen Clerk namun belum aktif sepenuhnya.
- [ ] **Task 1.5 (Dashboard Page)**: Buat halaman `/dashboard` lengkap dengan kartu statistik (total proyek, proyek berjalan, klien, anggota), daftar proyek terbaru, dan daftar aktivitas terbaru dari data dummy.
- [ ] **Task 1.6 (Projects List & Filter)**: Buat halaman `/projects` dengan tabel/kartu daftar proyek, search input, filter status, filter klien, filter tech stack, dan tombol reset filter.
- [ ] **Task 1.7 (Project Detail Page)**: Buat halaman `/projects/[projectId]` dengan hero proyek, badge status, informasi tech stack, widget repository GitHub (status, branch, stars, latest commit dari data dummy), kredensial yang dapat disembunyikan/ditampilkan menggunakan tombol mata, serta tab Anggota Tim, Catatan, dan Aktivitas.
- [ ] **Task 1.8 (Project Create & Edit Pages)**: Buat halaman `/projects/new` dan `/projects/[projectId]/edit` dengan formulir lengkap dan state dummy; pastikan pilihan klien muncul dari mock data klien dan status adalah pilihan tetap.
- [ ] **Task 1.9 (Clients Pages)**: Buat halaman `/clients` untuk menampilkan master data klien, plus halaman `/clients/new` dan `/clients/[clientId]/edit` untuk tambah dan edit klien.
- [ ] **Task 1.10 (Team Page)**: Buat halaman `/team` untuk Admin berisi tabel anggota tim, badge peran, dan modal undang anggota yang masih memakai state dummy.
- [ ] **Task 1.11 (Responsive Review & UI Polish)**: Periksa seluruh halaman pada tahap dummy di ukuran mobile, tablet, dan desktop; pastikan tidak ada halaman kosong, placeholder, atau "Sedang dalam pengembangan".

### Tahap 2: Database, Autentikasi, & Integrasi Data Dinamis
*Tujuan: Menghidupkan aplikasi dengan database nyata, autentikasi Clerk, dan Server Actions.*

- [ ] **Task 2.1 (Database Setup & Migration)**: Buat file `schema.ts` sesuai PRD Bab 10, pasang Drizzle Kit, buat database Neon PostgreSQL, jalankan migrasi, dan buat script seed untuk akun admin pertama.
- [ ] **Task 2.2 (Clerk Integration & Webhooks)**: Pasang Clerk provider, konfigurasi middleware untuk melindungi seluruh route authenticated, buat route handler webhook `users.created`, `users.updated`, `users.deleted`, dan tetapkan akun dengan email `INITIAL_ADMIN_EMAIL` sebagai role Admin.
- [ ] **Task 2.3 (Session Helper & Authorization)**: Buat helper server untuk mengambil data member dari Clerk session, helper `isAdmin()`, helper `getCurrentMember()`, dan public server action untuk proteksi hak akses.
- [ ] **Task 2.4 (Log Aktivitas Helper)**: Buat fungsi `createActivityLog` yang menerima `memberId`, `projectId`, `action`, `entityType`, dan `metadata`; implementasikan helper perbandingan data sebelum dan sesudah perubahan.
- [ ] **Task 2.5 (Server Actions CRUD Proyek)**: Buat Server Actions `createProject`, `updateProject`, `deleteProject`, dan `getProjects` beserta validasi Zod; setiap operasi menulis log aktivitas.
- [ ] **Task 2.6 (Server Actions CRUD Klien)**: Buat Server Actions `createClient`, `updateClient`, dan `deleteClient` dengan aturan anti-hapus jika klien masih digunakan proyek.
- [ ] **Task 2.7 (Server Actions Anggota Proyek)**: Buat Server Actions `addProjectMember`, `removeProjectMember`, dan `updateProjectMemberRole` yang mencatat log aktivitas `MEMBER_ADDED` dan `MEMBER_REMOVED`.
- [ ] **Task 2.8 (Server Actions Catatan Proyek)**: Buat Server Actions `addProjectNote`, `updateProjectNote`, `deleteProjectNote`, dan `togglePinNote` dengan aturan kepemilikan data.
- [ ] **Task 2.9 (Bind Projects Pages ke Database)**: Hubungkan halaman `/dashboard`, `/projects`, `/projects/[projectId]`, `/projects/new`, dan `/projects/[projectId]/edit` agar memakai data dari database.
- [ ] **Task 2.10 (Bind Clients, Team, Notes ke Database)**: Hubungkan halaman `/clients`, `/clients/new`, `/clients/[clientId]/edit`, `/team`, serta tab catatan dan anggota proyek agar data aktif dari database menggantikan mock data.
- [ ] **Task 2.11 (Enkripsi Kredensial)**: Implementasikan fungsi enkripsi dan dekripsi menggunakan AES-256-GCM dengan `CREDENTIAL_ENCRYPTION_KEY`; pastikan nilai password tidak pernah ditulis langsung ke log.
- [ ] **Task 2.12 (Integrasi Real GitHub API)**: Buat modul server-side GitHub API helper menggunakan token `GITHUB_TOKEN`, hubungkan widget repository pada detail proyek untuk mengambil default branch, status visibilitas, dan commit terbaru secara real-time dengan caching revalidate 5-10 menit.

### Tahap 3: Keamanan, SEO, Optimasi Performa, & Deployment
*Tujuan: Menyempurnakan kualitas produksi, keamanan, SEO, dan rilis ke production.*

- [ ] **Task 3.1 (SEO Metadata)**: Implementasikan `generateMetadata` untuk halaman publik proyek dengan judul dinamis, meta description, Open Graph, dan `noindex` untuk halaman authenticated.
- [ ] **Task 3.2 (Keamanan & Validasi Lanjutan)**: Periksa semua Server Actions, sanitasi input untuk mencegah XSS, validasi Zod di seluruh form, gunakan `redirect` yang aman, dan lakukan proteksi route pada level server.
- [ ] **Task 3.3 (Integrasi Bunny CDN)**: Konfigurasi Bunny CDN untuk aset statis publik, optimasi gambar dengan gambar dari CDN, dan pastikan fallback lokal tetap berjalan.
- [ ] **Task 3.4 (Optimasi Query & Performa)**: Tambahkan index yang diperlukan di Drizzle migration, optimasi query dashboard untuk menggunakan `Promise.all`, gunakan komponen streaming dan loading UI untuk daftar panjang.
- [ ] **Task 3.5 (End-to-End User Journey Testing)**: Uji alur lengkap mulai dari login admin, tambah klien, buat proyek, tambah anggota tim, tambah catatan, ubah status proyek, dan verifikasi seluruhnya muncul di log aktivitas; perbaiki error, responsive glitches, dan bug validasi.
- [ ] **Task 3.6 (Production Build & Deployment)**: Siapkan file `.env.production`, verifikasi `npm run build` berhasil tanpa error, lakukan migrasi database production ke Neon, dan deploy aplikasi ke hosting target (Vercel/VPS) dengan environment variable yang lengkap.

---

## 12. Master Starter Prompt (Siap Coding untuk AI Agent)

```markdown
Halo! Kamu berperan sebagai Senior Fullstack Architect dan Lead Developer.
Saya ingin membangun aplikasi "Project Management" berdasarkan dokumen PRD ini.

Silakan baca file @PRD.md

ATURAN EKSEKUSI (WAJIB DIPATUHI):
1. JANGAN PERNAH membuat semua kode atau file sekaligus dalam satu waktu agar tidak terjadi error atau kehabisan token.
2. Pahami dokumen PRD secara menyeluruh terlebih dahulu.
3. Mode eksekusi yang digunakan adalah MODE PHASE / MILESTONE.
4. Kamu WAJIB menyelesaikan satu phase penuh dalam satu putaran kerja, misalnya seluruh Tahap 1 dari Task 1.1 sampai Task 1.11 harus selesai secara mandiri sebelum kamu berhenti.
5. Setelah satu phase selesai, laporkan ringkasan hasil pekerjaan, daftar halaman atau fitur yang sudah berjalan, dan berhenti untuk menunggu konfirmasi saya sebelum lanjut ke Tahap berikutnya.
6. Selalu patuhi Tech Stack, skema database, Pedoman UI/UX Design System, dan aturan data dummy berbahasa Indonesia yang tertulis di PRD.
7. DILARANG membuat halaman placeholder atau "Sedang dalam pengembangan". Semua halaman wajib dibuat lengkap dengan data dummy pada Tahap 1.

Jika kamu sudah membaca dan memahami PRD, silakan berikan ringkasan singkat pemahamanmu dan konfirmasikan bahwa kamu siap memulai Tahap 1 dari Task 1.1!
```
