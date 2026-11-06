# DESIGN.md: Keuangan Adhika

Reading this as: aplikasi pencatat keuangan pribadi untuk pemakaian sehari-hari di HP, mengikuti desain "Artha" yang diberikan pemilik (hijau zamrud, Plus Jakarta Sans, kartu putih membulat, 5 tab), dalam versi jujur tanpa hiasan palsu. Dial ENERGY 2 / RHYTHM 2 / MOTION 2.

## Asal arah desain
Pemilik memberikan lima mockup HTML (Ringkasan, Transaksi, Statistik, Kalender, Pengaturan). Keputusan pemilik pada 2026-11-06:
- Fitur yang butuh bank atau server (Transfer, Kirim Dana, Scan QRIS, Bayar Sekarang, rekening terhubung, sinkronisasi cloud, akun/premium) dihapus semua.
- "Versi jujur": angka pembanding dan catatan dihitung dari data pengguna, tanpa label AI; kartu saldo hijau polos tanpa gradasi/blur/glow; header dan tab bar solid; badge "Real-time"/"Terkoneksi" dan titik berkedip dihapus; label tidak memakai huruf besar berjarak lebar.
- Nama aplikasi: Keuangan Adhika. Tanpa foto atau profil karena aplikasi tidak punya akun.
- Pengingat, kunci sidik jari, dan ekspor tidak dibuat (tidak dipilih).

## Palet

| Token | Terang | Gelap | Alasan |
|---|---|---|---|
| `bg` | `#FAF8FF` | `#0F1420` | Latar putih kebiruan dari mockup; kartu putih tampak terangkat tanpa bayangan tebal. |
| `card` | `#FFFFFF` | `#191F2C` | Lembar konten. |
| `cardAlt` / `container` | `#F2F3FF` / `#EAEDFF` | `#222A3A` / `#2A3244` | Kotak sekunder, chip tidak aktif, jalur progress. |
| `text` | `#131B2E` | `#E2E6F3` | Tinta navy dari mockup. |
| `muted` / `subtle` | `#3D4A42` / `#5E6A63` | `#B4C0B8` / `#98A49C` | Label dan teks sekunder, semua di atas 4.5:1. |
| `primary` / pemasukan | `#006948` | `#68DBA9` | Hijau zamrud: satu aksen untuk aksi utama, tab aktif, dan pemasukan. |
| `expense` | `#BA1A1A` | `#FFB4AB` | Merah hanya untuk pengeluaran, batas anggaran terlampaui, dan peringatan. |
| `chart` | 5 warna | 5 warna | Hanya untuk donat kategori; setiap warna minimal 3:1 terhadap kartu, potongan dipisah celah. |

Semua pasangan teks dicek dengan `contrast-check.py` (anti-slop) di kedua tema.

## Tipografi
Plus Jakarta Sans (400, 500, 600, 700, 800) sesuai mockup: huruf geometris yang tetap jelas untuk angka besar. Semua nominal memakai angka tabular supaya digit sejajar.

## Komposisi
- Satu titik fokus per layar: kartu saldo (Ringkasan), total periode (Transaksi, Statistik), kalender bulan (Kalender).
- Kartu putih sudut 16 dengan bayangan sangat tipis (elevasi 1) sebagai lembar di atas latar; tombol "Catat Baru" satu-satunya elevasi tebal karena mengambang di atas konten.
- Kartu saldo hijau solid dengan dua aksi (Pemasukan, Pengeluaran) menggantikan "Tambah Saldo" dan "Kirim Dana" dari mockup.
- Lebar konten maksimal 560 di tablet.

## Ikon
MaterialIcons (keluarga yang sama dengan Material Symbols di mockup). Setiap ikon menggambarkan isinya: kategori (restoran, mobil, tas belanja), tab (dashboard, struk, grafik, kalender, pengaturan). Tidak ada ikon hiasan seperti bintang atau kilau.

## Angka dan klaim
Tidak ada angka contoh. Persentase pembanding dihitung dari periode sebelumnya dan disembunyikan bila periode sebelumnya kosong. Catatan di Ringkasan dan Statistik hanya muncul bila datanya ada.

## Gerak
- Umpan balik saat ditekan dan form yang muncul dari bawah.
- Donat di Statistik tergambar dari kosong dan angka persen di tengah naik dari 0 setiap kali layar dibuka atau datanya berganti (permintaan pemilik, 2026-11-06). Tujuannya menuntun mata ke pembagian kategori. Saat kategori lain dipilih, hanya angka di tengah yang dihitung ulang.
- Semua animasi dimatikan bila pengguna menyalakan "kurangi gerakan".

## Tema
Mengikuti tema sistem HP (terang/gelap).
