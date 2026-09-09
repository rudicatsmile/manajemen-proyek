export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export type MemberRole = "admin" | "member";

export type ProjectMemberRole =
  | "project_manager"
  | "frontend"
  | "backend"
  | "fullstack"
  | "designer"
  | "qa"
  | "other";

export type ActivityAction =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_STATUS_CHANGED"
  | "PROJECT_DELETED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "NOTE_CREATED"
  | "NOTE_UPDATED"
  | "NOTE_DELETED";

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
  projectsCount?: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  specialization: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  memberId: string;
  projectId: string;
  role: ProjectMemberRole;
  assignedAt: string;
  member: Member;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  projectName?: string;
  memberId: string;
  memberName: string;
  action: ActivityAction;
  details: string;
  createdAt: string;
}

export interface GitHubRepoDetails {
  connected: boolean;
  repoUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  starsCount: number;
  openIssuesCount: number;
  latestCommit: {
    message: string;
    authorName: string;
    authorAvatar?: string;
    committedAt: string;
    hash: string;
  };
}

export type CredentialType = "ssh" | "database" | "cpanel" | "api" | "vps" | "other";

export interface ProjectCredential {
  id: string;
  projectId: string;
  name: string;
  type: string;
  host?: string;
  port?: string;
  username: string;
  passwordPlain?: string;
  passwordEncrypted?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CREDENTIAL_TYPE_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  ssh: {
    label: "SSH Server",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300",
  },
  database: {
    label: "Database",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  },
  cpanel: {
    label: "cPanel / Panel",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  api: {
    label: "API / Service",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
  },
  vps: {
    label: "VPS / Server",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  other: {
    label: "Lainnya",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400",
  },
};

export interface Project {
  id: string;
  name: string;
  clientId: string;
  client: Client;
  status: ProjectStatus;
  description: string;
  frontendTech: string;
  backendTech: string;
  databaseTech: string;
  repositoryUrl: string;
  credentialUsername?: string;
  credentialPasswordEncrypted?: string;
  credentialPasswordPlain?: string; // Khusus mock demo
  credentials: ProjectCredential[];
  githubDetails: GitHubRepoDetails;
  members: ProjectMember[];
  notes: ProjectNote[];
  createdAt: string;
  updatedAt: string;
}

export const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  planning: {
    label: "Perencanaan",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800/60",
  },
  in_progress: {
    label: "Sedang Berjalan",
    bgClass: "bg-blue-50 dark:bg-blue-950/40",
    textClass: "text-blue-700 dark:text-blue-400",
    borderClass: "border-blue-200 dark:border-blue-800/60",
  },
  on_hold: {
    label: "Tertunda",
    bgClass: "bg-slate-100 dark:bg-slate-800/60",
    textClass: "text-slate-700 dark:text-slate-300",
    borderClass: "border-slate-200 dark:border-slate-700",
  },
  completed: {
    label: "Selesai",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    textClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-200 dark:border-emerald-800/60",
  },
  cancelled: {
    label: "Dibatalkan",
    bgClass: "bg-rose-50 dark:bg-rose-950/40",
    textClass: "text-rose-700 dark:text-rose-400",
    borderClass: "border-rose-200 dark:border-rose-800/60",
  },
};

export const PROJECT_ROLE_LABELS: Record<ProjectMemberRole, string> = {
  project_manager: "Project Manager",
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  fullstack: "Fullstack Developer",
  designer: "UI/UX Designer",
  qa: "QA & Tester",
  other: "Anggota Tim",
};

// 1. Master Clients
export const INITIAL_CLIENTS: Client[] = [
  {
    id: "client-1",
    name: "Bapak Hendra Wijaya",
    companyName: "Pemerintah Desa Sukamaju",
    email: "desa.sukamaju@example.id",
    phone: "0812-3456-7890",
    address: "Jl. Raya Sukamaju No. 12, Jawa Barat",
    notes: "Klien instansi desa, koordinasi melalui WhatsApp grup dan rapat mingguan.",
    createdAt: "2026-01-10T08:00:00Z",
    projectsCount: 1,
  },
  {
    id: "client-2",
    name: "Ibu Ratna Dewi",
    companyName: "PT Nusantara Sejahtera Solusindo",
    email: "ratna@nusantara-solusindo.co.id",
    phone: "0821-9876-5432",
    address: "Menara BCA Lantai 28, Jakarta Pusat",
    notes: "Perusahaan manufaktur, membutuhkan dokumen kepatuhan NDA ketat.",
    createdAt: "2026-01-15T09:30:00Z",
    projectsCount: 1,
  },
  {
    id: "client-3",
    name: "Bapak Budi Santoso",
    companyName: "CV Harapan Jaya Logistik",
    email: "budi@harapanjayalog.com",
    phone: "0813-2233-4455",
    address: "Kawasan Industri Candi Blok A5, Semarang",
    notes: "Fokus pada kecepatan respon aplikasi untuk pelacakan armada lapangan.",
    createdAt: "2026-02-01T10:00:00Z",
    projectsCount: 1,
  },
  {
    id: "client-4",
    name: "Ibu Maya Lestari",
    companyName: "Yayasan Pendidikan Bina Bangsa",
    email: "maya@binabangsa.sch.id",
    phone: "0857-1122-3344",
    address: "Kompleks Pendidikan Bina Bangsa, Bandung",
    notes: "Jadwal peluncuran harus siap sebelum tahun ajaran baru.",
    createdAt: "2026-02-14T11:20:00Z",
    projectsCount: 1,
  },
  {
    id: "client-5",
    name: "dr. Farhan Malik",
    companyName: "Klinik Sehat Sentosa Mandiri",
    email: "farhan@sehatsentosa.co.id",
    phone: "0819-5566-7788",
    address: "Jl. Teuku Umar No. 45, Surabaya",
    notes: "Membutuhkan standardisasi bridging SatuSehat Kemenkes.",
    createdAt: "2026-03-01T08:45:00Z",
    projectsCount: 1,
  },
];

// 2. Master Members
export const INITIAL_MEMBERS: Member[] = [
  {
    id: "mem-1",
    name: "Rian Pratama",
    email: "admin@projectku.id",
    role: "admin",
    specialization: "Lead Fullstack Architect",
    createdAt: "2025-12-01T08:00:00Z",
  },
  {
    id: "mem-2",
    name: "Dimas Saputra",
    email: "dimas.dev@projectku.id",
    role: "member",
    specialization: "Senior Frontend Engineer",
    createdAt: "2026-01-05T08:00:00Z",
  },
  {
    id: "mem-3",
    name: "Anisa Rahmawati",
    email: "anisa.tech@projectku.id",
    role: "member",
    specialization: "Backend & Database Architect",
    createdAt: "2026-01-08T08:00:00Z",
  },
  {
    id: "mem-4",
    name: "Gilang Ramadhan",
    email: "gilang.pm@projectku.id",
    role: "member",
    specialization: "Technical Project Manager",
    createdAt: "2026-01-12T08:00:00Z",
  },
  {
    id: "mem-5",
    name: "Tari Kusuma",
    email: "tari.qa@projectku.id",
    role: "member",
    specialization: "QA & Automation Tester",
    createdAt: "2026-01-20T08:00:00Z",
  },
  {
    id: "mem-6",
    name: "Eko Prasetyo",
    email: "eko.ui@projectku.id",
    role: "member",
    specialization: "UI/UX Product Designer",
    createdAt: "2026-02-01T08:00:00Z",
  },
];

// 3. Master Projects
export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Sistem Informasi Desa (SI-Desa)",
    clientId: "client-1",
    client: INITIAL_CLIENTS[0],
    status: "in_progress",
    description:
      "Aplikasi pengelolaan administrasi desa, bansos, surat menyurat, dan data kependudukan berbasis web untuk aparat desa dan warga.",
    frontendTech: "Next.js 15, TypeScript, Tailwind CSS",
    backendTech: "NestJS, REST API",
    databaseTech: "PostgreSQL",
    repositoryUrl: "https://github.com/eduwbemu/si-desa",
    credentialUsername: "admin_sidesa",
    credentialPasswordEncrypted: "enc_9f86d081884c7d659a2f_demo",
    credentialPasswordPlain: "DesaSukamaju2026!",
    credentials: [
      {
        id: "cred-1-1",
        projectId: "proj-1",
        name: "Server Production (VPS)",
        type: "vps",
        host: "103.145.22.89",
        port: "22",
        username: "admin_sidesa",
        passwordPlain: "DesaSukamaju2026!",
        passwordEncrypted: "enc_9f86d081884c7d659a2f_demo",
        notes: "Akses root via sudoers",
      },
      {
        id: "cred-1-2",
        projectId: "proj-1",
        name: "Database PostgreSQL Prod",
        type: "database",
        host: "pg-sidesa.internal.net",
        port: "5432",
        username: "sidesa_user",
        passwordPlain: "PostgresSecurePass2026!",
        passwordEncrypted: "enc_5f4dcc3b5aa765d61d83_demo",
        notes: "Database cluster primer",
      },
    ],
    githubDetails: {
      connected: true,
      repoUrl: "https://github.com/eduwbemu/si-desa",
      defaultBranch: "main",
      isPrivate: false,
      starsCount: 32,
      openIssuesCount: 2,
      latestCommit: {
        message: "feat: integrasi modul export surat keterangan domisili",
        authorName: "Rian Pratama",
        committedAt: "2 jam yang lalu",
        hash: "8f4a19b",
      },
    },
    members: [
      {
        id: "pm-1",
        memberId: "mem-1",
        projectId: "proj-1",
        role: "fullstack",
        assignedAt: "2026-01-12T09:00:00Z",
        member: INITIAL_MEMBERS[0],
      },
      {
        id: "pm-2",
        memberId: "mem-2",
        projectId: "proj-1",
        role: "frontend",
        assignedAt: "2026-01-12T09:00:00Z",
        member: INITIAL_MEMBERS[1],
      },
      {
        id: "pm-3",
        memberId: "mem-4",
        projectId: "proj-1",
        role: "project_manager",
        assignedAt: "2026-01-12T09:00:00Z",
        member: INITIAL_MEMBERS[3],
      },
    ],
    notes: [
      {
        id: "note-1",
        projectId: "proj-1",
        authorId: "mem-4",
        authorName: "Gilang Ramadhan",
        title: "Konfirmasi Persyaratan Modul Surat Menyurat",
        content:
          "Pihak desa meminta penambahan QR Code verifikasi pada lembar surat keterangan domisili dan surat kematian agar sah secara digital.",
        isPinned: true,
        createdAt: "2026-02-10T14:30:00Z",
        updatedAt: "2026-02-10T14:30:00Z",
      },
      {
        id: "note-2",
        projectId: "proj-1",
        authorId: "mem-1",
        authorName: "Rian Pratama",
        title: "Setup Database & Seed Data Master RT/RW",
        content:
          "Struktur tabel dusun, RW, dan RT sudah berhasil diuji coba dengan 1.200 sampel data kependudukan lokal.",
        isPinned: false,
        createdAt: "2026-01-25T10:15:00Z",
        updatedAt: "2026-01-25T10:15:00Z",
      },
    ],
    createdAt: "2026-01-12T08:00:00Z",
    updatedAt: "2026-03-08T16:00:00Z",
  },
  {
    id: "proj-2",
    name: "Portal Ekspedisi dan Pelacakan Armada",
    clientId: "client-3",
    client: INITIAL_CLIENTS[2],
    status: "in_progress",
    description:
      "Platform pemantauan armada truk ekspedisi secara real-time dengan integrasi GPS IoT dan pelacakan status manifest pengiriman logistik.",
    frontendTech: "React, Vite, Tailwind CSS",
    backendTech: "Go (Golang), Fiber",
    databaseTech: "PostgreSQL, Redis",
    repositoryUrl: "https://github.com/nusantara-tech/harapan-tracking",
    credentialUsername: "ops_supervisor",
    credentialPasswordEncrypted: "enc_7a12b489912c_demo",
    credentialPasswordPlain: "FleetTracking#892",
    credentials: [
      {
        id: "cred-2-1",
        projectId: "proj-2",
        name: "Server Gateway IoT",
        type: "ssh",
        host: "103.88.10.45",
        port: "2222",
        username: "ops_supervisor",
        passwordPlain: "FleetTracking#892",
        notes: "SSH port non-standar",
      },
    ],
    githubDetails: {
      connected: true,
      repoUrl: "https://github.com/nusantara-tech/harapan-tracking",
      defaultBranch: "master",
      isPrivate: true,
      starsCount: 14,
      openIssuesCount: 1,
      latestCommit: {
        message: "fix: kalkulasi estimasi waktu kedatangan rute pantura",
        authorName: "Anisa Rahmawati",
        committedAt: "5 jam yang lalu",
        hash: "3c98e12",
      },
    },
    members: [
      {
        id: "pm-4",
        memberId: "mem-3",
        projectId: "proj-2",
        role: "backend",
        assignedAt: "2026-02-02T10:00:00Z",
        member: INITIAL_MEMBERS[2],
      },
      {
        id: "pm-5",
        memberId: "mem-5",
        projectId: "proj-2",
        role: "qa",
        assignedAt: "2026-02-02T10:00:00Z",
        member: INITIAL_MEMBERS[4],
      },
    ],
    notes: [
      {
        id: "note-3",
        projectId: "proj-2",
        authorId: "mem-3",
        authorName: "Anisa Rahmawati",
        title: "Spesifikasi Endpoint Telemetri GPS",
        content:
          "GPS hardware mengirimkan paket data socket tiap 15 detik. Redis cache digunakan untuk menyimpan lokasi terakhir tiap plat nomor.",
        isPinned: true,
        createdAt: "2026-02-12T09:00:00Z",
        updatedAt: "2026-02-12T09:00:00Z",
      },
    ],
    createdAt: "2026-02-02T09:00:00Z",
    updatedAt: "2026-03-09T01:30:00Z",
  },
  {
    id: "proj-3",
    name: "SIAKAD & Ujian Online Terpadu",
    clientId: "client-4",
    client: INITIAL_CLIENTS[3],
    status: "completed",
    description:
      "Sistem manajemen data siswa, guru, rekap nilai rapor kurikulum merdeka, dan modul tryout ujian online berbasis komputer (CBT).",
    frontendTech: "Next.js 14, Shadcn UI",
    backendTech: "Laravel 11, REST API",
    databaseTech: "MySQL",
    repositoryUrl: "https://github.com/binabangsa/siakad-core",
    credentialUsername: "dev_academic",
    credentialPasswordEncrypted: "enc_5e88bb901a_demo",
    credentialPasswordPlain: "AcadBina2025!",
    credentials: [
      {
        id: "cred-3-1",
        projectId: "proj-3",
        name: "cPanel Kampus Staging",
        type: "cpanel",
        host: "cpanel.binanusantara.ac.id",
        port: "2083",
        username: "dev_academic",
        passwordPlain: "AcadBina2025!",
        notes: "Hosting panel kampus",
      },
    ],
    githubDetails: {
      connected: true,
      repoUrl: "https://github.com/binabangsa/siakad-core",
      defaultBranch: "production",
      isPrivate: true,
      starsCount: 45,
      openIssuesCount: 0,
      latestCommit: {
        message: "release: v1.4.0 modul cetak buku induk selesai UAT",
        authorName: "Dimas Saputra",
        committedAt: "Kemarin",
        hash: "7d11f04",
      },
    },
    members: [
      {
        id: "pm-6",
        memberId: "mem-2",
        projectId: "proj-3",
        role: "frontend",
        assignedAt: "2026-01-15T08:30:00Z",
        member: INITIAL_MEMBERS[1],
      },
      {
        id: "pm-7",
        memberId: "mem-6",
        projectId: "proj-3",
        role: "designer",
        assignedAt: "2026-01-15T08:30:00Z",
        member: INITIAL_MEMBERS[5],
      },
    ],
    notes: [
      {
        id: "note-4",
        projectId: "proj-3",
        authorId: "mem-2",
        authorName: "Dimas Saputra",
        title: "Hasil User Acceptance Test (UAT)",
        content:
          "Seluruh skenario pengujian rapor dan bank soal telah disetujui pihak kepala sekolah tanpa catatan kritis.",
        isPinned: false,
        createdAt: "2026-03-01T16:00:00Z",
        updatedAt: "2026-03-01T16:00:00Z",
      },
    ],
    createdAt: "2026-01-15T08:30:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "proj-4",
    name: "Rekam Medis Elektronik & Antrean Poli",
    clientId: "client-5",
    client: INITIAL_CLIENTS[4],
    status: "planning",
    description:
      "Digitalisasi rekam medis pasien sesuai standar SatuSehat Kemenkes dan integrasi pemanggilan nomor antrean pada display ruang tunggu klinik.",
    frontendTech: "Vue 3, Nuxt, Tailwind CSS",
    backendTech: "Express.js, Node.js",
    databaseTech: "PostgreSQL",
    repositoryUrl: "https://github.com/sehatsentosa/med-record",
    credentialUsername: "clinic_staff",
    credentialPasswordEncrypted: "enc_112233aabb_demo",
    credentialPasswordPlain: "MedSecurePass99*",
    credentials: [
      {
        id: "cred-4-1",
        projectId: "proj-4",
        name: "Server Rekam Medis Lokal",
        type: "vps",
        host: "192.168.1.200",
        port: "22",
        username: "clinic_staff",
        passwordPlain: "MedSecurePass99*",
        notes: "Hanya dapat diakses melalui intranet klinik",
      },
    ],
    githubDetails: {
      connected: true,
      repoUrl: "https://github.com/sehatsentosa/med-record",
      defaultBranch: "main",
      isPrivate: true,
      starsCount: 8,
      openIssuesCount: 4,
      latestCommit: {
        message: "chore: inisialisasi arsitektur Drizzle schema dan auth",
        authorName: "Rian Pratama",
        committedAt: "3 hari yang lalu",
        hash: "1e55a89",
      },
    },
    members: [
      {
        id: "pm-8",
        memberId: "mem-1",
        projectId: "proj-4",
        role: "fullstack",
        assignedAt: "2026-03-02T11:00:00Z",
        member: INITIAL_MEMBERS[0],
      },
      {
        id: "pm-9",
        memberId: "mem-3",
        projectId: "proj-4",
        role: "backend",
        assignedAt: "2026-03-02T11:00:00Z",
        member: INITIAL_MEMBERS[2],
      },
    ],
    notes: [
      {
        id: "note-5",
        projectId: "proj-4",
        authorId: "mem-1",
        authorName: "Rian Pratama",
        title: "Kebutuhan Integrasi API SatuSehat",
        content:
          "Memerlukan verifikasi sertifikat digital klinik dan sandbox client ID dari DTO Kemenkes sebelum staging.",
        isPinned: true,
        createdAt: "2026-03-03T13:00:00Z",
        updatedAt: "2026-03-03T13:00:00Z",
      },
    ],
    createdAt: "2026-03-02T11:00:00Z",
    updatedAt: "2026-03-06T14:20:00Z",
  },
  {
    id: "proj-5",
    name: "Marketplace Pengadaan B2B Manufaktur",
    clientId: "client-2",
    client: INITIAL_CLIENTS[1],
    status: "on_hold",
    description:
      "Portal lelang dan pengadaan bahan baku manufaktur antar perusahaan skala nasional dengan sistem multi-approval PO dan penawaran tender.",
    frontendTech: "Next.js 15, TypeScript",
    backendTech: "Python FastAPI, Microservices",
    databaseTech: "PostgreSQL, MongoDB",
    repositoryUrl: "https://github.com/nusantara-solusindo/b2b-procurement",
    credentialUsername: "b2b_procure_lead",
    credentialPasswordEncrypted: "enc_998877ccdd_demo",
    credentialPasswordPlain: "VendorAuth99!",
    credentials: [
      {
        id: "cred-5-1",
        projectId: "proj-5",
        name: "Server Cloud Kubernetes",
        type: "ssh",
        host: "k8s-master.b2bprocure.co.id",
        port: "22",
        username: "b2b_procure_lead",
        passwordPlain: "VendorAuth99!",
        notes: "Bastion host jumpbox",
      },
    ],
    githubDetails: {
      connected: true,
      repoUrl: "https://github.com/nusantara-solusindo/b2b-procurement",
      defaultBranch: "develop",
      isPrivate: true,
      starsCount: 19,
      openIssuesCount: 7,
      latestCommit: {
        message: "wip: skema persetujuan purchasing order bertingkat",
        authorName: "Gilang Ramadhan",
        committedAt: "1 minggu yang lalu",
        hash: "6b22c71",
      },
    },
    members: [
      {
        id: "pm-10",
        memberId: "mem-4",
        projectId: "proj-5",
        role: "project_manager",
        assignedAt: "2026-01-20T08:00:00Z",
        member: INITIAL_MEMBERS[3],
      },
      {
        id: "pm-11",
        memberId: "mem-6",
        projectId: "proj-5",
        role: "designer",
        assignedAt: "2026-01-20T08:00:00Z",
        member: INITIAL_MEMBERS[5],
      },
    ],
    notes: [
      {
        id: "note-6",
        projectId: "proj-5",
        authorId: "mem-4",
        authorName: "Gilang Ramadhan",
        title: "Penundaan Modul Pembayaran Escrow",
        content:
          "Proyek ditunda sementara menunggu restrukturisasi regulasi internal perbankan mitra klien.",
        isPinned: false,
        createdAt: "2026-02-28T15:00:00Z",
        updatedAt: "2026-02-28T15:00:00Z",
      },
    ],
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-02-28T15:00:00Z",
  },
];

// 4. Global Activity Logs
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "act-1",
    projectId: "proj-1",
    projectName: "Sistem Informasi Desa (SI-Desa)",
    memberId: "mem-1",
    memberName: "Rian Pratama",
    action: "PROJECT_UPDATED",
    details: "Memperbarui konfigurasi repositori GitHub dan branch utama",
    createdAt: "10 menit yang lalu",
  },
  {
    id: "act-2",
    projectId: "proj-1",
    projectName: "Sistem Informasi Desa (SI-Desa)",
    memberId: "mem-4",
    memberName: "Gilang Ramadhan",
    action: "NOTE_CREATED",
    details: "Menambahkan catatan baru: Konfirmasi Persyaratan Modul Surat Menyurat",
    createdAt: "1 jam yang lalu",
  },
  {
    id: "act-3",
    projectId: "proj-2",
    projectName: "Portal Ekspedisi dan Pelacakan Armada",
    memberId: "mem-3",
    memberName: "Anisa Rahmawati",
    action: "PROJECT_STATUS_CHANGED",
    details: "Mengubah status proyek dari 'Perencanaan' menjadi 'Sedang Berjalan'",
    createdAt: "4 jam yang lalu",
  },
  {
    id: "act-4",
    projectId: "proj-3",
    projectName: "SIAKAD & Ujian Online Terpadu",
    memberId: "mem-2",
    memberName: "Dimas Saputra",
    action: "PROJECT_STATUS_CHANGED",
    details: "Mengubah status proyek menjadi 'Selesai' setelah rilis v1.4.0",
    createdAt: "1 hari yang lalu",
  },
  {
    id: "act-5",
    projectId: "proj-4",
    projectName: "Rekam Medis Elektronik & Antrean Poli",
    memberId: "mem-1",
    memberName: "Rian Pratama",
    action: "PROJECT_CREATED",
    details: "Membuat proyek baru untuk klien Klinik Sehat Sentosa Mandiri",
    createdAt: "2 hari yang lalu",
  },
  {
    id: "act-6",
    projectId: "proj-4",
    projectName: "Rekam Medis Elektronik & Antrean Poli",
    memberId: "mem-1",
    memberName: "Rian Pratama",
    action: "MEMBER_ADDED",
    details: "Menambahkan Anisa Rahmawati sebagai Backend Developer",
    createdAt: "2 hari yang lalu",
  },
];

// Helper functions for mock data retrieval
export function getProjects(): Project[] {
  return INITIAL_PROJECTS;
}

export function getProjectById(id: string): Project | undefined {
  return INITIAL_PROJECTS.find((p) => p.id === id);
}

export function getClients(): Client[] {
  return INITIAL_CLIENTS;
}

export function getClientById(id: string): Client | undefined {
  return INITIAL_CLIENTS.find((c) => c.id === id);
}

export function getMembers(): Member[] {
  return INITIAL_MEMBERS;
}

export function getActivityLogs(): ActivityLog[] {
  return INITIAL_ACTIVITY_LOGS;
}

export function getDashboardStats() {
  const projects = INITIAL_PROJECTS;
  const inProgressCount = projects.filter((p) => p.status === "in_progress").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const planningCount = projects.filter((p) => p.status === "planning").length;

  return {
    totalProjects: projects.length,
    inProgressProjects: inProgressCount,
    completedProjects: completedCount,
    planningProjects: planningCount,
    totalClients: INITIAL_CLIENTS.length,
    totalMembers: INITIAL_MEMBERS.length,
  };
}
