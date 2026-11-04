# DESIGN.md: Keuanganku

Reading this as: aplikasi pencatat keuangan pribadi untuk pengguna Indonesia sehari-hari, dengan bahasa visual buku kas yang tenang dan rapi, dial ENERGY 1 / RHYTHM 1 / MOTION 1.

## Karakter
Seperti buku kas: kertas terang, tinta gelap, angka jelas. Yang paling penting di setiap layar adalah angka uang, bukan hiasan.

## Palet
Dua warna inti dan satu aksen. Merah hanya dipakai untuk pengeluaran.

| Token | Terang | Gelap | Alasan |
|---|---|---|---|
| `bg` (kertas) | `#F6F5F1` | `#151716` | Putih hangat seperti kertas buku kas, tidak menyilaukan. |
| `card` | `#FFFFFF` | `#1E2120` | Lembar di atas kertas, cukup beda dari latar tanpa bayangan. |
| `text` (tinta) | `#1D1F1E` | `#ECEDEA` | Tinta gelap untuk angka dan judul. |
| `muted` | `#5B605C` | `#A3A8A4` | Label sekunder, tetap di atas 4.5:1. |
| `accent` / pemasukan | `#1E5B43` | `#7FD1A6` | Hijau tua uang: satu aksen untuk aksi utama dan pemasukan. |
| `expense` | `#A8321E` | `#FF8A75` | Merah bata untuk pengeluaran, lebih kalem dari merah terang. |
| `line` | `#DEDCD4` | `#2E3230` | Garis buku bergaris (dekoratif, pemisah baris). |
| `control` | `#8A8E8A` | `#6E746F` | Garis tepi kontrol, minimal 3:1 terhadap latar. |

Semua pasangan teks sudah dicek dengan `contrast-check.py` (anti-slop) dan lolos WCAG AA di kedua tema.

## Tipografi
Font sistem (Roboto di Android, SF di iPhone): paling terbaca di HP, ikut ukuran huruf yang diatur pengguna, dan tidak menambah ukuran aplikasi.
Semua nominal memakai angka tabular (`fontVariant: ['tabular-nums']`) supaya digit sejajar seperti kolom buku kas.

## Motif identitas
Garis ganda di bawah angka total. Ini konvensi pembukuan untuk menandai jumlah akhir, dan dipakai di setiap total (saldo, total harian, total bulanan).
Daftar transaksi ditulis seperti baris buku kas: dipisah garis tipis, nominal rata kanan.

## Komposisi
- Satu titik fokus per layar: total saldo (Beranda), total hari itu (Harian), sisa bulan itu (Bulanan).
- Kartu datar dengan garis tepi tipis, tanpa bayangan. Satu-satunya elevasi ada di tombol "Catat" karena tombol itu mengambang di atas konten.
- Sudut membulat 12 untuk kartu dan 10 untuk kontrol; tidak ada elemen berbentuk pil kecuali tombol "Catat".
- Lebar konten maksimal 560 dan diletakkan di tengah, supaya tetap terbaca di tablet.

## Ikon
- Tab bar hanya teks, karena tiga tujuan cukup jelas dengan kata; penanda aktif berupa garis aksen dan huruf tebal.
- Emoji kategori (🍜 🛵 🛒 dan seterusnya) dipertahankan: tiap emoji menggambarkan isi kategorinya dan mempercepat pengenalan di daftar. Selalu didampingi nama kategori.

## Gerak
Hanya umpan balik saat ditekan, ditambah form yang muncul dari bawah. Animasi form dimatikan jika pengguna menyalakan "kurangi gerakan".

## Tema
Mengikuti tema sistem HP (terang/gelap).
