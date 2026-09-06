# Manajemen Barang — Aktivitas Mingguan & Biodata Kasir
## Perubahan

- Dashboard **Aktivitas Penjualan** sekarang menghitung penjualan secara dinamis untuk **minggu berjalan, Senin–Minggu**, berdasarkan tanggal transaksi.
- Grafik menampilkan omzet per hari dan jumlah item per hari.
- Semua input/transaksi yang sebelumnya memakai jam sekarang hanya memakai **tanggal (hari-bulan-tahun)**.
- Tanggal di riwayat, laporan, stock opname, dan struk juga ditampilkan tanpa jam.
- Bagian **Profil Website** tidak digunakan lagi.
- Admin tetap memiliki **Data Diri Admin**.
- Admin tetap dapat merekrut, mengaktifkan/nonaktifkan, dan menghapus kasir.
- Admin **tidak lagi memiliki tombol untuk melihat biodata kasir**.
- Kasir mengisi biodata sendiri melalui Pengaturan.
- Foto profil kasir sekarang dapat dipilih langsung dari perangkat dengan input file gambar.
- Foto dibatasi maksimal 3 MB dan disimpan sebagai bagian dari biodata lokal browser.
- Biodata kasir tetap hanya dapat diedit oleh kasir yang bersangkutan.

## Login demo
- Admin: `admin@demo.local` / `admin123`
- Kasir: `user@demo.local` / `kasir123`

## Catatan
Data aplikasi masih menggunakan `localStorage` browser. Untuk penggunaan multi-device/cloud diperlukan backend dan database.
- Dashboard header hanya menampilkan tanggal (tanpa jam).
- Seluruh tanggal transaksi tetap menggunakan tanggal + jam yang bisa diedit: Kasir, Barang Masuk, Barang Keluar, dan Stock Opname.
- Riwayat/laporan dan struk menampilkan tanggal + jam transaksi.
- Aktivitas penjualan Dashboard tetap berjalan per minggu Senin-Minggu berdasarkan tanggal transaksi.
- Foto profil Admin dan Kasir mendukung upload gambar langsung dari perangkat.
- Foto profil ditampilkan dengan rasio 3x4.
- Admin kembali mendapatkan tombol **Lihat Biodata** pada setiap kasir.
- Lihat Biodata berfungsi sebagai tampilan read-only; Admin tidak dapat mengubah biodata kasir.
- Kasir tetap menjadi pihak yang mengisi/mengubah biodatanya sendiri.
- Kolom tanggal transaksi Kasir dan Stock Opname benar-benar menggunakan tanggal + jam.
- Semua modul transaksi tetap menyimpan ISO datetime sehingga aktivitas penjualan mingguan tetap akurat.
- Header Dashboard hanya menampilkan tanggal tanpa jam.
- Viewer biodata kasir milik Admin bersifat read-only dan tombolnya berfungsi.
