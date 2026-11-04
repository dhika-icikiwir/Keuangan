# Keuanganku

Aplikasi pencatat keuangan pribadi untuk Android/iOS (Expo + React Native).

- **Beranda** — total saldo, ringkasan hari ini dan bulan ini, transaksi terakhir.
- **Harian** — pemasukan & pengeluaran per hari, geser tanggal dengan ‹ ›, rata-rata pengeluaran 7 hari.
- **Bulanan** — total per bulan, sisa/tabungan, grafik pengeluaran harian, rincian per kategori, ringkasan per hari.
- Tambah / ubah / hapus transaksi (ketuk transaksi untuk mengubah).
- Data tersimpan di HP (offline), tidak dikirim ke mana pun.

## Pasang di HP Android (APK)

Setiap push ke GitHub, workflow **Build APK Android** membangun APK secara otomatis (±10–15 menit).

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
