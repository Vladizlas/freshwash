# Peta fitur FreshWash Express — mengacu PDF Tema 05

## 1. Autentikasi dan hak akses

- `src/app/login/page.tsx`: login email/password.
- `src/app/setup/page.tsx` dan `src/app/api/auth/setup/route.ts`: buat Administrator pertama jika belum ada akun.
- `src/lib/auth.ts`: cookie sesi HTTP-only bertanda tangan, validasi sesi, logout.
- `src/app/users/page.tsx`, `src/app/api/users/*`: manajemen pegawai dan role, khusus admin di UI dan API.

## 2. Dashboard eksekutif

- `src/app/page.tsx`: empat KPI, tren transaksi 7 hari, ringkasan alur proses, 8 nota terbaru, dan quick action.

## 3. Transaksi inti

- `src/app/transactions/new/page.tsx`: pelanggan, paket, berat minimal 3 kg, multi-item satuan, diskon, estimasi dan pilihan pembayaran.
- `src/app/api/transactions/route.ts`: validasi server, hitung tarif dari master, invoice unik, transaksi DB atomik, pembayaran awal dan history status.
- `src/app/transactions/[id]/page.tsx`: detail pesanan, pembayaran, update status berurutan, riwayat pembayaran dan status.
- `src/app/transactions/[id]/receipt/page.tsx`: nota resi/barcode dan layout cetak/PDF.
- `src/app/api/transactions/[id]/*`: update status dan pencatatan pembayaran.
- `src/models/index.ts`: model pelanggan, users, paket, item satuan, transaksi, detail item, pembayaran dan riwayat proses.

## 4. Laporan dan ekspor

- `src/app/reports/page.tsx`: filter tanggal/paket/status pembayaran, KPI berat dan pendapatan, daftar laporan.
- `src/app/api/reports/csv/route.ts` dan `xlsx/route.ts`: ekspor CSV dan Excel dengan filter yang sama.
- `src/app/reports/print/page.tsx`: laporan siap cetak / Save as PDF.

## Master data dan utilitas

- `src/app/services/page.tsx` dan `src/app/api/services/*`: master paket/tarif kiloan, durasi layanan, serta harga item satuan (khusus admin).
- `src/app/customers/*` dan `src/app/api/customers/*`: CRUD pelanggan.
- `src/lib/db.ts`: koneksi MySQL, sinkronisasi tabel proyek praktik dan seed paket/item awal.
- `src/lib/validators.ts`: validasi input server-side.
- `src/lib/invoice.ts`: format invoice `NOT-LDY-YYYYMMDD-XXXX`.
- `scripts/seed-demo.ts`: akun demo dan pelanggan contoh.
