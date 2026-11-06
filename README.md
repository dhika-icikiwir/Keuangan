# Keuangan Adhika

Aplikasi pencatat keuangan pribadi untuk Android/iOS (Expo + React Native).

- Ringkasan: saldo (bisa disembunyikan), pemasukan dan pengeluaran periode ini dibanding periode lalu, pos anggaran, transaksi terbaru, pengeluaran 7 hari terakhir.
- Transaksi: cari, filter pemasukan/pengeluaran, total per periode, daftar per hari.
- Statistik: per minggu, bulan, atau tahun; donat per kategori, grafik tren, kategori yang paling naik.
- Kalender: tanda pemasukan, pengeluaran, dan tagihan per tanggal; catatan per hari; tagihan rutin yang bisa ditandai lunas.
- Pengaturan: kategori buatan sendiri, batas anggaran per kategori, target tabungan, tanggal mulai periode bulanan.
- Data tersimpan hanya di HP (offline), tidak dikirim ke mana pun. Mengikuti tema terang/gelap HP.

Arah desain ada di `DESIGN.md`.

## Pasang di HP Android (APK)

Setiap push ke GitHub, workflow **Build APK Android** membangun APK secara otomatis (sekitar 10 sampai 15 menit).

1. Buka repo di GitHub → **Releases** (atau tab **Actions** → run terbaru → *Artifacts*).
2. Unduh `app-release.apk` dari HP.
3. Buka file tersebut dan pilih **Instal**. Jika diminta, izinkan "Instal dari sumber tidak dikenal".

## Coba lewat Expo Go (Android/iPhone)

```bash
npm install
npx expo start
```
Pasang aplikasi **Expo Go** dari Play Store/App Store, lalu pindai QR code yang muncul (HP dan komputer harus di jaringan Wi-Fi yang sama, atau pakai `npx expo start --tunnel`).

## Pengembangan

```bash
npx tsc --noEmit                      # cek tipe
npx expo export --platform android    # cek bundle
```
