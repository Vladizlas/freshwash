# FreshWash Express — Sistem Operasional Laundry Kiloan & Dry Clean

Proyek praktik full-stack yang diselaraskan dengan PDF **Tema 05: Sistem Operasional Laundry Kiloan & Dry Clean**. Stack dipertahankan: Next.js App Router, TypeScript, Tailwind CSS, Sequelize, MySQL/XAMPP.

## Empat modul wajib

1. **Autentikasi & hak akses** — login email/password, bcrypt hash, cookie sesi HTTP-only, logout, proteksi halaman/API. Role sesuai PDF: Administrator/Pemilik Usaha (`admin`) dan Front Desk/Operator Kasir (`cashier`). Admin mengelola pegawai, paket/tarif dan laporan; kasir menangani pelanggan, transaksi, status proses, nota dan pembayaran.
2. **Dashboard** — cucian masuk hari ini (berat dan jumlah nota), transaksi sedang diproses, siap diambil, omzet bulan ini, grafik transaksi 7 hari, riwayat nota terakhir, dan quick action transaksi baru.
3. **Transaksi inti** — nomor nota otomatis `NOT-LDY-YYYYMMDD-XXXX`; pelanggan; paket/tarif; berat minimal 3 kg untuk kiloan; beberapa item satuan dengan kuantitas; diskon; estimasi selesai; catatan pakaian; pembayaran; status berurutan Menunggu Antrean → Sedang Dicuci → Pengeringan → Setrika → Siap Diambil → Selesai Diambil; log perubahan status; larangan pengambilan sebelum lunas; nota dengan barcode dan syarat ketentuan. Total dihitung dan divalidasi di server dari master tarif.
4. **Laporan & ekspor** — filter tanggal, paket dan status pembayaran; total berat; pendapatan kiloan dan satuan; jumlah piutang; tabel sesuai spesifikasi; ekspor CSV dan Excel; tampilan cetak yang dapat disimpan sebagai PDF.

## Persyaratan

- Node.js LTS
- MySQL aktif dari XAMPP
- Database `freshwash`

## Instalasi

1. Ekstrak ZIP lalu buka folder `freshwash` di VS Code.
2. Jalankan MySQL melalui XAMPP.
3. Buka phpMyAdmin, lalu impor `database.sql` atau jalankan:
   ```sql
   CREATE DATABASE freshwash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Salin `.env.example` menjadi `.env.local`. Sesuaikan DB bila perlu dan ganti `AUTH_SECRET` dengan string acak minimal 32 karakter.
5. Instal dependensi dan jalankan aplikasi:
   ```bash
   npm install
   npm run dev
   ```
6. Buka `http://localhost:3000/setup` untuk membuat akun Administrator/Pemilik pertama jika belum ada akun.
7. Login di `http://localhost:3000/login`.

## Akun demo dan master data

Untuk membuat akun demo, satu pelanggan contoh, paket awal, dan item satuan, jalankan:

```bash
npm run seed:demo
```

Kredensial demo yang dibuat oleh seeder:

| Role                          | Email                   | Password             |
| ----------------------------- | ----------------------- | -------------------- |
| Administrator / Pemilik Usaha | `admin@freshwash.local` | `FreshWashAdmin123!` |
| Front Desk / Operator Kasir   | `kasir@freshwash.local` | `FreshWashKasir123!` |

Password di database disimpan dalam bentuk hash bcrypt. Jalankan seeder hanya pada database pengembangan/praktik; ganti password akun sebelum dipakai pada lingkungan nyata.

## Menu

- **Dashboard**: ringkasan operasional dan grafik tren.
- **Transaksi**: daftar, detail, pembayaran, status, riwayat, dan nota.
- **Transaksi baru**: penerimaan cucian kiloan dan/atau satuan.
- **Pelanggan**: data pelanggan.
- **Paket & Tarif** _(admin)_: menambah master paket dan item satuan.
- **Laporan** _(admin)_: filter, rekap, CSV, Excel, dan cetak/PDF.
- **Manajemen Pegawai** _(admin)_: membuat akun dan mengatur role.

## Catatan database dan keamanan

- Sequelize membuat/menyesuaikan tabel serta memasukkan paket dan item satuan awal pada koneksi pertama. `sequelize.sync({ alter: true })` ditujukan untuk kemudahan proyek praktik lokal; untuk produksi, gunakan migrasi yang dikontrol, backup, dan review perubahan skema.
- Proteksi role dijalankan di sisi server, bukan hanya dengan menyembunyikan menu.
- Untuk deployment publik, aktifkan HTTPS, gunakan `AUTH_SECRET` yang kuat, password database kuat, rate limiting, CSRF protection, logging audit, dan backup terjadwal.
- Fitur ini merupakan proyek praktik dan belum diaudit sebagai sistem kasir produksi.

## Format kode

```bash
npm run format
npm run format:check
npm run lint
npm run build
```
