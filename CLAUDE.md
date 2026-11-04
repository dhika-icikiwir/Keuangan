# Panduan untuk AI (Claude & agen lain) di repo ini

Baca juga `AGENTS.md` untuk aturan Expo/React Native.

## Tentang proyek
Keuanganku: aplikasi pencatat keuangan pribadi (Expo + React Native + TypeScript).
- `App.tsx` — tab bar (Beranda / Harian / Bulanan) dan tombol tambah.
- `src/store.tsx` — state transaksi, disimpan di AsyncStorage (offline, di HP).
- `src/format.ts` — format Rupiah dan tanggal. Tanggal disimpan sebagai string lokal `YYYY-MM-DD`.
- `src/categories.ts` — daftar kategori pemasukan/pengeluaran.
- `src/screens/*` — layar. `src/components/*` — komponen bersama.
- `.github/workflows/build-apk.yml` — membangun APK otomatis setiap push.

Bahasa antarmuka: **Bahasa Indonesia**. Mata uang: **Rupiah** tanpa desimal (`Rp 1.500.000`).

## Aturan anti "AI slop"

### Kode
1. **Kerjakan yang diminta saja.** Jangan menambah fitur, abstraksi, file, atau dependensi yang tidak diminta.
2. **Jangan menambah dependensi** kalau bisa ditulis dalam beberapa baris. Kalau perlu, pakai `npx expo install`, dan pastikan masih jalan di Expo Go.
3. **Ikuti pola yang sudah ada** (gaya `StyleSheet`, warna dari `src/theme.ts`, format dari `src/format.ts`). Jangan membuat helper kedua yang fungsinya sama.
4. **Tanpa komentar basa-basi.** Komentar hanya untuk menjelaskan *kenapa*, bukan mengulang *apa* yang sudah jelas dari kode. Tanpa `// TODO` kosong, tanpa kode mati, tanpa `console.log` tertinggal.
5. **Tanpa kode placeholder** atau data palsu yang pura-pura berfungsi. Kalau sesuatu belum bisa dibuat, katakan terus terang.
6. **Jangan ubah format data tersimpan** (`@keuangan/transactions/v1`) tanpa migrasi — data pengguna di HP tidak boleh hilang.
7. Sebelum selesai: jalankan `npx tsc --noEmit` dan `npx expo export --platform android` dan pastikan keduanya lolos.

### Tulisan (UI, README, commit, jawaban)
1. **Langsung ke inti.** Tanpa pembuka seperti "Tentu saja!", "Pertanyaan bagus!", tanpa penutup seperti "Semoga membantu!".
2. **Jangan melebih-lebihkan.** Hindari kata seperti "canggih", "revolusioner", "mulus", "solusi lengkap", "memberdayakan".
3. **Jujur soal hasil.** Kalau tes gagal atau langkah dilewati, tulis begitu. Jangan mengklaim sudah dicek kalau belum.
4. **Teks UI pendek dan biasa** seperti aplikasi lokal pada umumnya: "Simpan", "Hapus", "Pengeluaran". Bukan kalimat panjang.
5. **Emoji secukupnya** — hanya ikon kategori/tab yang sudah ada. Jangan tabur emoji di teks atau commit.
6. **Pesan commit**: satu baris ringkas apa yang berubah dan alasannya bila perlu.
7. **Jangan membuat daftar bertingkat panjang** kalau satu-dua kalimat cukup.

### Cara kerja
- Baca kode yang relevan dulu sebelum mengubah.
- Kalau permintaan ambigu dan pilihannya berdampak besar, tanya. Kalau tidak, pilih opsi yang paling wajar dan sebutkan.
- Perubahan kecil dan terfokus lebih baik daripada menulis ulang file.
