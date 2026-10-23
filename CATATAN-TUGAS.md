# LaporCepat — Implementasi TASK 01–03 (Mobile Programming)

## TASK 01 — Handle API Error
Semua request dikontrol `services/apiClient.js`:

- **2xx** → data dikembalikan hanya saat `res.ok` (success).
- **4xx** → pesan spesifik per status:
  - 400: "Permintaan tidak valid. Periksa isian Anda (400)."
  - 401: "Sesi berakhir. Silakan masuk kembali (401)."
  - 403: "Akses ditolak. Anda tidak punya izin (403)."
  - 404: "Data tidak ditemukan. Laporan yang Anda cari tidak tersedia."
- **5xx** → "Terjadi kesalahan pada server. Silakan coba lagi nanti."
- **Request gagal** (network error / tanpa internet) →
  "Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi."
- Semua error dibungkus `ApiError` dengan properti `status` dan `kategori`
  (`offline | timeout | server | notfound | client | generic`) agar UI bisa
  menampilkan ikon + pesan yang sesuai.
- **Data tidak ditampilkan** saat request gagal — list hanya dirender dari data sukses.

## TASK 02 — Loading, Error & Retry
- **Loading indicator**: skeleton card + teks "Memuat data… Mohon tunggu sebentar."
  (HomeScreen) dan spinner pada aksi tulis (kirim/edit status).
- **Error message**: tampil dalam state box berikon (wifi/search/server/time).
- **Retry button**: tombol "Coba Lagi" pada state error.
- **Request ulang**: menekan retry menampilkan "Mencoba lagi… Mengambil data
  terbaru." lalu mengirim request ulang (`onRefresh` → `getLaporan`).

## TASK 03 — Handle Offline
- Banner **"Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi."**
  muncul otomatis di atas layar saat internet terputus dan hilang saat pulih
  (`components/OfflineBanner.js` + `services/connectivity.js`).
- Deteksi offline memakai `@react-native-community/netinfo`. Jalankan:

  ```bash
  npm install          # atau: npx expo install @react-native-community/netinfo
  ```

  Tanpa modul tersebut pun, request yang gagal tetap terdeteksi offline
  di apiClient (network error pada fetch).
- Layar tidak pernah kosong: selalu ada pesan + tombol Coba Lagi.

## Cara Pengujian
### A. Dengan simulator bawaan (mode Mock API aktif)
Di Beranda ada panel **"Uji Kondisi API"**:
1. **Normal (2xx)** — data tampil normal.
2. **Tanpa Internet** — semua request gagal → muncul pesan offline + tombol Coba Lagi.
3. **Client Error 404** — pesan "Data tidak ditemukan…" + tombol Coba Lagi.
4. **Server Error 500** — pesan "Terjadi kesalahan pada server…" + tombol Coba Lagi.
Update status, buat, atau hapus laporan juga ikut gagal saat mode non-normal.

### B. Dengan internet perangkat sungguhan (TASK 03)
1. Jalankan aplikasi dengan internet aktif (data tampil).
2. Matikan Wi-Fi / data seluler.
3. Banner offline muncul; aksi buat laporan akan menampilkan pesan offline.
4. Aktifkan kembali internet → tekan Coba Lagi → data dimuat.

### C. Dengan backend asli
Isi `API_BASE_URL` di `config.js` lalu uji status HTTP nyata:
hentikan server (5xx), salah path (404), atau cabut jaringan.

## Fitur lain di repo ini
- **Peta sungguhan** (OpenStreetMap + Leaflet via WebView) — terpusat di **Malang, Jawa Timur**, bisa digeser & di-zoom; pin per laporan; tap pin → ubah status cepat.
- **Pilih titik lokasi di peta** saat membuat laporan (koordinat lat/lng ikut tersimpan, PATCH/POST `/laporan`).
- **Update status laporan** (modal detail: timeline progres + chip status; PATCH `/laporan/:id`).
- **Restyle** palet indigo–violet terpusat di `theme.js`.

## Menjalankan
```bash
npm install
npx expo start
```
Pilih: **a** (Android), **i** (iOS), **w** (browser), atau scan QR dengan aplikasi **Expo Go**.
Catatan: tile OpenStreetMap butuh internet — saat mode "Tanpa Internet", tile tidak muncul (itu memang kondisi offline). Ganti kembali ke mode "Normal" untuk melihat peta.
