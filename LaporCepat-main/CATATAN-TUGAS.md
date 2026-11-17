# LaporCepat — Implementasi TASK 01–03 (Mobile Programming)

## Modul 3 — Async & API Call (Cuaca Malang / Open-Meteo)

### Endpoint yang dipakai
```
GET https://api.open-meteo.com/v1/forecast
    ?latitude=-7.9797&longitude=112.6304
    &current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m
    &timezone=Asia%2FBangkok
```
API publik gratis **tanpa API key**. Response asli (diverifikasi langsung):
`current: { time, interval, temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m }`
dikelilingi metadata (`latitude`, `longitude`, `timezone`, `current_units`, dst).
Field `weather_code` adalah kode cuaca WMO (0 = cerah, 1–2 = cerah berawan, ≥61 = hujan, dst).

### Alur Promise
1. `screens/HomeScreen.tsx` — `useEffect(() => { muatCuaca(); }, [])` dipanggil sekali saat layar dibuka.
   `muatCuaca` mengonsumsi Promise memakai rantai **`.then().catch().finally()`**:
   sukses → `setCuaca(data)`, gagal → `setCuacaError(e)`, dan `finally` mematikan loading.
2. `services/cuacaApi.ts` → `getCuaca()` — **custom async function** (`async/await`) yang
   `await fetchCuacaRaw()` lalu memetakan `CuacaResponse` → objek `CuacaInfo`
   (`suhu`, `kelembapan`, `angin`, `kondisi`, `ikon`) dengan bantuan `weatherCodeKeTeks(code)`.
3. `services/cuacaApi.ts` → `fetchCuacaRaw()` — Promise dibuat manual dengan
   **`new Promise<CuacaResponse>((resolve, reject) => ...)`** membungkus `fetch(...)`:
   - `res.ok` → **`resolve(res.json())`**
   - status 4xx/5xx → **`reject(new ApiError(...))`** (pakai ulang `ApiError` + `PESAN_API` dari `apiClient.ts`)
   - `.catch()` → network error (offline) / timeout (`AbortController` + `API_TIMEOUT_MS`) → `reject` bertanda kategori.
4. Hasil `CuacaInfo` dirender oleh `components/CuacaCard.tsx` (props bertipe interface).

### Perilaku penting
- **Data TIDAK ditampilkan saat gagal** — kartu cuaca hanya dirender dari data sukses; saat error
  tampil pesan sesuai kategori (`kategoriError`) + tombol "Coba Lagi" yang memanggil ulang `getCuaca`.
- **Simulator kondisi API ikut berlaku untuk cuaca**: mode "Tanpa Internet / 404 / 500"
  di panel "Uji Kondisi API" (laporanApi `getSimulasi()`) juga membuat fetch cuaca gagal.
- `utils/delay.ts` — util `delay()` bersama (new Promise + `resolve` + `setTimeout`);
  duplikasi lokal di `services/laporanApi.ts` dan `services/userApi.ts` dihapus,
  perilaku mock tidak berubah.

### Cara uji
1. Buka Beranda → kartu cuaca Malang tampil di atas (suhu, kelembapan, angin, kondisi).
2. Tekan mode **"Tanpa Internet"** di panel Uji Kondisi API → kartu cuaca berubah jadi
   pesan offline + tombol Coba Lagi (banner offline juga muncul). Kembali ke **"Normal"**
   → Coba Lagi → cuaca tampil lagi.
3. Uji **"Client Error 404"** dan **"Server Error 500"** → pesan kategori berbeda.
4. Matikan Wi-Fi perangkat sungguhan → fetch gagal (network error) → pesan offline.
5. (Opsional) Naikkan/blokir jaringan untuk melihat timeout (`API_TIMEOUT_MS`).

## TASK 01 — Handle API Error
Semua request dikontrol `services/apiClient.ts`:

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
  (`components/OfflineBanner.tsx` + `services/connectivity.ts`).
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
Isi `API_BASE_URL` di `config.ts` lalu uji status HTTP nyata:
hentikan server (5xx), salah path (404), atau cabut jaringan.

## Fitur lain di repo ini
- **Peta sungguhan** (OpenStreetMap + Leaflet via WebView) — terpusat di **Malang, Jawa Timur**, bisa digeser & di-zoom; pin per laporan; tap pin → ubah status cepat.
- **Pilih titik lokasi di peta** saat membuat laporan (koordinat lat/lng ikut tersimpan, PATCH/POST `/laporan`).
- **Update status laporan** (modal detail: timeline progres + chip status; PATCH `/laporan/:id`).
- **Restyle** palet indigo–violet terpusat di `theme.ts`.

## Menjalankan
```bash
npm install
npx expo start
```
Pilih: **a** (Android), **i** (iOS), **w** (browser), atau scan QR dengan aplikasi **Expo Go**.
Catatan: tile OpenStreetMap butuh internet — saat mode "Tanpa Internet", tile tidak muncul (itu memang kondisi offline). Ganti kembali ke mode "Normal" untuk melihat peta.
