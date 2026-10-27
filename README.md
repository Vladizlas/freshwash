# FreshWash Express — Sistem Operasional Laundry Kiloan & Dry Clean

Proyek praktik full-stack yang diselaraskan dengan PDF **Tema 05: Sistem Operasional Laundry Kiloan & Dry Clean**. Stack dipertahankan: Next.js App Router, TypeScript, Tailwind CSS, Sequelize, MySQL/XAMPP.

## Empat modul wajib

1. **Autentikasi & hak akses** — login email/password, bcrypt hash, cookie sesi HTTP-only, logout, proteksi halaman/API. Role sesuai PDF: Administrator/Pemilik Usaha (`admin`) dan Front Desk/Operator Kasir (`cashier`). Admin mengelola pegawai, paket/tarif dan laporan; kasir menangani pelanggan, transaksi, status proses, nota dan pembayaran.
2. **Dashboard** — cucian masuk hari ini (berat dan jumlah nota), transaksi sedang diproses, siap diambil, omzet bulan ini, grafik transaksi 7 hari, riwayat nota terakhir, dan quick action transaksi baru.
3. **Transaksi inti** — nomor nota otomatis `NOT-LDY-YYYYMMDD-XXXX`; pelanggan; paket/tarif; berat minimal 3 kg untuk kiloan; beberapa item satuan dengan kuantitas; diskon; estimasi selesai; catatan pakaian; pembayaran; status berurutan Menunggu Antrean → Sedang Dicuci → Pengeringan → Setrika → Siap Diambil → Selesai Diambil; log perubahan status; larangan pengambilan sebelum lunas; nota dengan barcode dan syarat ketentuan. Total dihitung dan divalidasi di server dari master tarif.
4. **Laporan & ekspor** — filter tanggal, paket dan status pembayaran; total berat; pendapatan kiloan dan satuan; jumlah piutang; tabel sesuai spesifikasi; ekspor CSV dan Excel; tampilan cetak yang dapat disimpan sebagai PDF.

## Menu

- **Dashboard**: ringkasan operasional dan grafik tren.
- **Transaksi**: daftar, detail, pembayaran, status, riwayat, dan nota.
- **Transaksi baru**: penerimaan cucian kiloan dan/atau satuan.
- **Pelanggan**: data pelanggan.
- **Paket & Tarif** _(admin)_: menambah master paket dan item satuan.
- **Laporan** _(admin)_: filter, rekap, CSV, Excel, dan cetak/PDF.
- **Manajemen Pegawai** _(admin)_: membuat akun dan mengatur role.
- **Profile Saya** : Mengedit user saat ini.

