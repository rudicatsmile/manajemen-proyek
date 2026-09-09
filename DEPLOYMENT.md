# Panduan Deployment Produksi: Project Management

Dokumen panduan teknis langkah demi langkah untuk melakukan deployment aplikasi **Project Management** ke lingkungan produksi (Vercel, VPS/Docker, Neon PostgreSQL, dan Clerk Auth).

---

## 1. Persiapan Basis Data (Neon PostgreSQL)

1. Buat proyek database baru di konsol [Neon](https://console.neon.tech/).
2. Salin connection string PostgreSQL dengan format:
   ```text
   postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
   ```
3. Jalankan migrasi skema database dari lokal:
   ```bash
   pnpm db:push
   ```
4. Jalankan script seeding untuk akun admin dan data awal (opsional):
   ```bash
   pnpm db:seed
   ```

---

## 2. Persiapan Autentikasi (Clerk Production)

1. Masuk ke dashboard [Clerk](https://dashboard.clerk.com/) dan aktifkan mode Production instance.
2. Konfigurasikan URL redirect autentikasi:
   - Sign-in URL: `https://[domain-anda]/sign-in`
   - Sign-up URL: `https://[domain-anda]/sign-up`
   - After Sign-in URL: `https://[domain-anda]/dashboard`
3. Tambahkan endpoint Webhook di dashboard Clerk:
   - Webhook URL: `https://[domain-anda]/api/webhooks/clerk`
   - Subscribe events: `user.created`, `user.updated`, `user.deleted`
   - Salin **Signing Secret** dan masukkan ke environment variable `CLERK_WEBHOOK_SECRET`.

---

## 3. Menghasilkan Kunci Enkripsi Kredensial

Kredensial password server dienkripsi menggunakan algoritma `AES-256-GCM`. Hasilkan kunci hex acak 64 karakter (32 bytes) menggunakan perintah Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Simpan nilai output tersebut ke variable `CREDENTIAL_ENCRYPTION_KEY`.

---

## 4. Opsi Deployment A: Vercel (Disarankan)

1. Import repositori Git proyek ke akun [Vercel](https://vercel.com/).
2. Framework Preset akan otomatis terdeteksi sebagai **Next.js**.
3. Masukkan seluruh Environment Variables dari `.env.production.example`:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_WEBHOOK_SECRET`
   - `INITIAL_ADMIN_EMAIL`
   - `DATABASE_URL`
   - `CREDENTIAL_ENCRYPTION_KEY`
   - `GITHUB_TOKEN`
   - `NEXT_PUBLIC_CDN_URL` (opsional)
4. Klik tombol **Deploy**. Vercel akan menjalankan build Turbopack dan merilis aplikasi.

---

## 5. Opsi Deployment B: VPS / Server Mandiri (Node.js & PM2)

1. Clone repositori ke server VPS:
   ```bash
   git clone https://github.com/organisasi/project-management.git
   cd project-management
   ```
2. Pasang dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```
3. Siapkan file `.env.local` berisi seluruh variable produksi.
4. Bangun bundel aplikasi produksi:
   ```bash
   pnpm build
   ```
5. Jalankan aplikasi menggunakan PM2:
   ```bash
   pm2 start pnpm --name "project-management" -- start
   pm2 save
   pm2 startup
   ```
6. Konfigurasikan reverse proxy Nginx dengan SSL (Let's Encrypt Certbot) menuju port `3000`.

---

## 6. Verifikasi Pasca-Deployment

Periksa bahwa seluruh fungsi utama bekerja normal di domain produksi:

- [ ] Kunjungan halaman publik `/` memuat meta tags SEO dinamis dan Open Graph.
- [ ] Login melalui Clerk mengarahkan pengguna ke `/dashboard`.
- [ ] Pengguna dengan email `INITIAL_ADMIN_EMAIL` memiliki peran Admin.
- [ ] Pembuatan proyek baru menyimpan password dalam status terenkripsi (tidak muncul di log).
- [ ] Widget GitHub menampilkan branch dan commit secara live.
- [ ] Aturan anti-delete klien bekerja saat mencoba menghapus klien yang memiliki proyek aktif.
- [ ] Halaman authenticated (`/dashboard`, `/projects`, `/clients`, `/team`) memiliki tag `robots: noindex`.
