# ✅ CHECKLIST DEMO PEKAN — RUBRIK MODUL 3 (Async & API Call)

> Acuan berkas: (`C:\...\LaporCepat-main`). Semua berkas kode `.ts`/`.tsx` (TypeScript).
> Rubrik Modul 3: **60 poin** (3 kriteria teknis @10% + Menjawab Pertanyaan 15% + Modifikasi Kode 15%).

| Poin Rubrik Modul 3 | Bobot | Status |
| :--- | ---: | :---: |
| Mengambil data dari External API & memasukkannya ke Object menggunakan Interface | 10% | ✅ |
| Menggunakan Custom & Pre-built Async Function | 10% | ✅ |
| Menggunakan `.then()`, `.resolve()`, dan `.reject()` | 10% | ✅ |
| Menjawab Pertanyaan | 15% | 📝 (jawaban siap di bagian 4) |
| Menyelesaikan Modifikasi Kode | 15% | ✅ |
| **TOTAL** | **60%** | |

---

## 1. External API → Object dengan Interface — ✅ (10%) SUDAH

External API publik tanpa API key: **Open-Meteo** (data cuaca kota Malang, lat -7.9797 / lng 112.6304).
Bentuk response **diverifikasi langsung** sebelum interface ditulis (bukan ditebak).

| Bukti implementasi | Lokasi (file + nama) |
| :--- | :--- |
| `interface CuacaCurrent` & `interface CuacaResponse` (sesuai response asli API) | `types/cuaca.ts` |
| `interface CuacaInfo` — object yang dipakai UI (`suhu`, `kelembapan`, `angin`, `kondisi`, `ikon`) | `types/cuaca.ts` |
| Fetch ke external API + mapping response → object `CuacaInfo` | `services/cuacaApi.ts` → `fetchCuacaRaw()`, `getCuaca()`, `weatherCodeKeTeks()` |
| Konsumsi API di layar (state `CuacaInfo \| null`, loading, error) | `screens/HomeScreen.tsx` → `muatCuaca()`, `useEffect` |
| Kartu cuaca bertipe interface | `components/CuacaCard.tsx` → props `{ cuaca: CuacaInfo }` |

**Poin demonstrasi:** buka Beranda → kartu "Cuaca Malang • Open-Meteo" tampil di bagian atas
(suhu, kelembapan, angin, kondisi). Tunjukkan isi `types/cuaca.ts` lalu bandingkan dengan
response asli `https://api.open-meteo.com/v1/forecast?latitude=-7.9797&longitude=112.6304&...`.

## 2. Custom & Pre-built Async Function — ✅ (10%) SUDAH

| Jenis | Bukti | Lokasi (file + nama) |
| :--- | :--- | :--- |
| **Custom async** | `delay(ms)` — `new Promise` + `setTimeout`, dipakai seluruh service | `utils/delay.ts` → `delay()` (duplikat lokal di `services/laporanApi.ts` & `services/userApi.ts` dihapus) |
| **Custom async** | `getCuaca(): Promise<CuacaInfo>` — `async/await fetchCuacaRaw()` + mapping | `services/cuacaApi.ts` |
| **Custom async** | CRUD laporan: `getLaporan`, `getLaporanById`, `createLaporan`, `updateLaporan`, `deleteLaporan` (semua `Promise<T>` eksplisit) | `services/laporanApi.ts` |
| **Custom async** | CRUD user: `getUsers`, `getUserById`, `updateUser`, `deleteUser` | `services/userApi.ts` |
| **Pre-built async** | `fetch()` bawaan React Native + `res.json()` | `services/cuacaApi.ts` → `fetchCuacaRaw()` |
| **Pre-built async** | `setTimeout()` (delay mock & timeout `API_TIMEOUT_MS` via `AbortController`) | `utils/delay.ts`, `services/cuacaApi.ts` |
| **Pre-built async** | Promise chain `.then()/.catch()/.finally()` mengonsumsi hasil `getCuaca` | `screens/HomeScreen.tsx` → `muatCuaca()` |

**Poin demonstrasi:** tunjukkan `utils/delay.ts` (custom), lalu `services/cuacaApi.ts`
(`fetch` = pre-built, `getCuaca` = custom async/await).

## 3. `.then()`, `.resolve()`, `.reject()` — ✅ (10%) SUDAH

| Bukti | Lokasi (file + nama) |
| :--- | :--- |
| **`.then()`** — `fetch(...).then((res) => ...)` menentukan resolve/reject | `services/cuacaApi.ts` → `fetchCuacaRaw()` |
| **`.then()`** — rantai `.then().catch().finally()` di UI | `screens/HomeScreen.tsx` → `muatCuaca()` |
| **`.resolve()`** — `resolve(res.json())` saat `res.ok` | `services/cuacaApi.ts` → `fetchCuacaRaw()` |
| **`.resolve()`** — `resolve()` di dalam `new Promise` util delay | `utils/delay.ts` → `delay()` |
| **`.reject()`** — `reject(new ApiError(...))` untuk HTTP 4xx/5xx, offline, dan timeout | `services/cuacaApi.ts` → `fetchCuacaRaw()` |
| **`Promise.resolve()`** — pre-built static resolve saat ganti mode uji | `screens/HomeScreen.tsx` → `gantiModeUji()` |

**Poin demonstrasi:** buka `services/cuacaApi.ts` — satu fungsi `fetchCuacaRaw` memuat
`new Promise`, `resolve`, `reject`, `.then`, `.catch`, `.finally` sekaligus; lalu
`screens/HomeScreen.tsx` untuk rantai `.then/.catch/.finally`.

## 4. Menjawab Pertanyaan — 📝 (15%) RINCIAN SIAP PAKAI

### 4a. Kalimat jawaban inti per kriteria

**Kriteria 1 — External API → Object via Interface (10%)**
> "Saya mengambil data real-time dari external API publik tanpa API key — **Open-Meteo** (cuaca Malang). Response ditampung dulu di object bertipe **interface** (`CuacaResponse`), lalu dipetakan ke object UI (`CuacaInfo`) sebelum dirender. Interface ditulis setelah memverifikasi response aslinya, bukan ditebak."

Bukti: `types/cuaca.ts`, mapping di `getCuaca()` (`services/cuacaApi.ts`), render di `CuacaCard.tsx`.

**Kriteria 2 — Custom & Pre-built Async Function (10%)**
> "Custom: `delay()` di `utils/delay.ts` (new Promise + setTimeout, dipakai semua service), `getCuaca()`, dan seluruh CRUD laporan/user — semuanya bertipe `Promise<T>` eksplisit. Pre-built: `fetch()`, `res.json()`, dan `setTimeout()`."

**Kriteria 3 — `.then()`, `.resolve()`, `.reject()` (10%)**
> "Ketiganya ada di `fetchCuacaRaw()` (`services/cuacaApi.ts`): `new Promise((resolve, reject))` membungkus `fetch().then()` — `res.ok` → `resolve(res.json())`, selain itu → `reject(new ApiError(...))`, dan `.catch()` untuk network/timeout → `reject`. Di UI, `muatCuaca()` mengonsumsi hasilnya dengan `.then().catch().finally()`, dan `Promise.resolve()` dipakai di `gantiModeUji()`."

### 4b. Bank jawaban pertanyaan asisten

**Q: Apa beda `fetchCuacaRaw()` yang pakai `new Promise` dan `getCuaca()` yang pakai `async/await`?**
`fetchCuacaRaw` membuat Promise secara manual: executor `(resolve, reject)` membungkus `fetch().then()`
— sukses `resolve(res.json())`, gagal `reject(new ApiError(...))`. `getCuaca` hanyalah *konsumen*:
`async function` yang `await fetchCuacaRaw()` lalu memetakan `CuacaResponse` → `CuacaInfo`.
Dua gaya menunjukkan dua cara kerja Promise sesuai rubrik.

**Q: Kapan `resolve()` dan `reject()` dipanggil?**
`resolve()` saat `res.ok` (HTTP 2xx) dengan argumen `res.json()`. `reject()` di tiga tempat:
(1) status bukan 2xx → `ApiError` berkategori, (2) `.catch()` menangkap network error →
`ApiError.offline = true`, (3) `AbortError` timeout (`API_TIMEOUT_MS`) → kategori `timeout`.

**Q: Di mana `.then()` dipakai selain fetch?**
Di UI: `muatCuaca()` (HomeScreen):
`getCuaca().then(setCuaca).catch(setCuacaError).finally(...)` — loading dimatikan di
`.finally()` agar selalu jalan, baik sukses maupun gagal.

**Q: Kalau API gagal / offline, apa yang terjadi di layar?**
Data TIDAK ditampilkan. Cuaca: pesan sesuai kategori `kategoriError` + tombol Coba Lagi.
Banner offline (`OfflineBanner` + `useConnectivity`) tetap bekerja seperti sebelumnya.

**Q: Kenapa data cuaca ikut gagal saat mode "Tanpa Internet / 404 / 500" dipilih?**
`fetchCuacaRaw` memanggil helper `cekSimulasi()` yang membaca `getSimulasi()` dari
`services/laporanApi.ts` — simulator demo yang sama dipakai mock laporan dan fetch cuaca,
jadi mode uji non-"normal" juga melempar `ApiError` untuk cuaca (tanpa mengubah mock lama).

**Q: Apa fungsi `weatherCodeKeTeks(code)`?**
Menerjemahkan `weather_code` (kode WMO Open-Meteo) ke teks Indonesia + ikon Ionicons:
`0` → "Cerah" (sunny), `1–2` → "Cerah Berawan" (partly-sunny), `≥61` → "Hujan" (rainy), dst.

**Q: Apa itu Promise dan kenapa dipakai?**
Representasi hasil operasi asynchronous dengan 3 state: pending → fulfilled (resolve) /
rejected. Dipakai karena `fetch` tidak bisa diblokir — UI tetap responsif, hasil ditangani
lewat `.then`/`await`.

**Q: Bedanya `await` dan `.then()`?**
Sama-sama menunggu hasil Promise. `await` hanya di dalam `async function`, membuat kode
berurutan seperti sinkron; `.then()` bisa dipakai di mana saja dan bisa di-chaining.
Di kode: `await` di `getCuaca`, `.then()` di `fetchCuacaRaw` dan di layar.

**Q: Bagaimana penanganan error berlapis di aplikasi ini?**
4 lapis: (1) cek `res.ok` di `.then`, (2) network/timeout di `.catch`, (3) semua dilempar
sebagai `ApiError` berkategori (`kategoriError`), (4) UI memetakan kategori → pesan + ikon +
tombol Coba Lagi. Data tidak pernah tampil setengah-setengah.

**Q: Apa fungsi `AbortController`?**
Membatalkan `fetch` saat melewati `API_TIMEOUT_MS` (10 detik) agar tidak menunggu selamanya;
`AbortError` diterjemahkan menjadi pesan "Waktu request habis".

**Q: Kenapa data di-mapping ke interface baru, tidak langsung pakai response mentah?**
Supaya UI tidak terikat bentuk mentah API (field Inggris + metadata tak terpakai).
Jika API berubah, cukup ubah mapping di satu tempat (`getCuaca`).

## 5. Menyelesaikan Modifikasi Kode — ✅ (15%)

- 🌤️ **Fitur baru Modul 3**: cuaca Malang real-time dari Open-Meteo (kartu di atas Beranda,
  dengan loading skeleton, error per kategori, dan tombol Coba Lagi).
- 🧹 **Refactor**: util `delay()` dipusatkan di `utils/delay.ts` (hapus duplikasi di
  `laporanApi.ts` & `userApi.ts`), perilaku mock tidak berubah.
- 🧪 Simulator kondisi API kini juga menguji fetch cuaca sungguhan (offline/404/500).
- Detail: baca `CATATAN-TUGAS.md` → bagian "Modul 3 — Async & API Call".

---

## Modul 2 — expo-router (pekerjaan sebelumnya, BELUM selesai — tidak dikerjakan di sesi ini)

| Poin Rubrik Modul 2 | Bobot | Status |
| :--- | ---: | :---: |
| Menerapkan hook `useState` dan `useEffect()` | 10% | ✅ |
| Menerapkan `push()`, `back()`, dan 1 fungsi `expo-router` lainnya | 10% | ⬜ |
| Menerapkan `_layout.ts(x)` dan `<Stack.Screen>` | 10% | ⬜ |
| **TOTAL Modul 2** | **60%** | |

Navigasi masih manual via state di `App.tsx` (belum dimigrasi ke `expo-router`).
Rencana migrasi lama tetap tercatat: `onNavigate('buat')` → `router.push('/buat')`,
`onBack()` → `router.back()`, `setScreen('home')` → `router.replace('/')`,
ditambah `app/_layout.tsx` berisi `<Stack>` + `<Stack.Screen>` per rute.
Bukti Modul 2 yang sudah ada (masih valid): `useState` form di `screens/BuatLaporanScreen.tsx`,
`useState` di `screens/HomeScreen.tsx`, `useEffect` di `App.tsx` (`muatLaporan`),
`useEffect` splash di `components/SplashScreen.tsx`, NetInfo di `services/connectivity.ts`,
marker peta di `components/MapViewLeaflet.tsx`, modal detail di `components/LaporanDetailModal.tsx`.
