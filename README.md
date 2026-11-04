# Keuanganku

Aplikasi pencatat keuangan pribadi untuk Android/iOS (Expo + React Native).

- Beranda: saldo, ringkasan hari ini dan bulan ini, catatan terakhir.
- Harian: pemasukan dan pengeluaran per tanggal (geser dengan ‹ ›), rata-rata pengeluaran 7 hari.
- Bulanan: sisa bulan itu, pengeluaran per hari, rincian per kategori, ringkasan per hari.
- Tombol Catat untuk menambah transaksi; ketuk transaksi untuk mengubah atau menghapus.
- Data tersimpan di HP (offline), tidak dikirim ke mana pun.
- Mengikuti tema terang/gelap HP.

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
