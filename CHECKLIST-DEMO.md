# ✅ CHECKLIST DEMO PEKAN — RUBRIK 100%

> Akumulasi rubrik pemberi nilai. Acuan berkas: (`C:\...\LaporCepat-main`).
> Kode saat ini masih Expo **tanpa `expo-router`** (navigasi manual state di `App.js`).
> Item yang sudah/belum ditandai di bawah + rencana menit menit pengerjaannya.

| Poin Rubrik | Bobot | Status |
| :--- | ---: | :---: |
| Menerapkan hook `useState` dan `useEffect()` | 10% | ✅ |
| Menerapkan `push()`, `back()`, dan 1 fungsi `expo-router` lainnya | 10% | ⬜ |
| Menerapkan `_layout.ts(x)` dan `<Stack.Screen>` | 10% | ⬜ |
| Menjawab Pertanyaan | 15% | 📝 (siap disiap) |
| Menyelesaikan Modifikasi Kode | 15% | ✅ |
| **TOTAL** | **60%** | |

---

## 1. Hook `useState` dan `useEffect()` — ✅ (10%) SUDAH

| Bukti implementasi | Lokasi |
| :--- | :--- |
| `useState` untuk form (judul, deskripsi, kategori) | `screens/BuatLaporanScreen.js` |
| `useState` pencarian, filter, status mode uji | `screens/HomeScreen.js` |
| `useEffect` memuat laporan ketika user login | `App.js` (`useEffect(... muatLaporan)`) |
| `useEffect` timer splash screen 1,4 detik | `components/SplashScreen.js` |
| `useEffect` mengatur AutoNetInfo listener | `services/connectivity.js` |
| `useEffect` mengirim marker ke peta setiap data berubah | `components/MapViewLeaflet.js` |
| `useEffect` sync status modal detail | `components/LaporanDetailModal.js` |

**Poin demonstrasi:** buka HomeScreen (useEffect fetch API), buat laporan (useState form), ubah chip status, matikan internet (useEffect NetInfo → banner offline).

## 2. Navigasi `push()`, `back()` + 1 fungsi expo-router lainnya — ⬜ (10%) BELUM, RENCANA

Saat ini navigasi masih manual via `setScreen(...)` di `App.js`.
Rencana migrasi `expo-router` (dipetakan dari navigasi lama):
| Navigasi lama (state) | Baru (expo-router) |
| :--- | :--- |
| `onNavigate('buat')` | `router.push('/buat')` |
| `onBack()` | `router.back()` |
| `setScreen('home')` setelah submit | `router.replace('/')` |
| `onNavigate('peta')` | `router.push('/peta')` |
| `onNavigate('profil')` | `router.push('/profil')` |

### Langkah pengerjaan (± 30 menit)
1. `npx expo install expo-router react-native-safe-area-context`
2. `package.json`: `"main": "expo-router/entry"`
3. Buat folder `app/`:
   - `app/_layout.jsx` → `<Stack>` + `<Stack.Screen>` tiap route.
   - `app/index.jsx` → pindahkan isi `HomeScreen`
   - `app/buat.jsx`, `app/peta.jsx`, `app/profil.jsx`
4. Setiap layar memakai `<Stack.Screen options={{ title: ... }}>` untuk judul header.
5. Hapus navigasi `setScreen` manual; state laporan dipindah ke context.
6. Tes `router.push`, `router.back` (tombol back header & gestur swipe).

## 3. `_layout.ts(x)` & `<Stack.Screen>` — ⬜ (10%) BELUM, RENCANA

Contoh `app/_layout.jsx` yang akan dipakai setelah migrasi:

```jsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#6D5EF8' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="index" options={{ title: 'LaporCepat', headerShown: false }} />
      <Stack.Screen name="buat" options={{ title: 'Buat Laporan', headerShown: false }} />
      <Stack.Screen name="peta" options={{ title: 'Peta Laporan', headerShown: false }} />
      <Stack.Screen name="profil" options={{ title: 'Profil', headerShown: false }} />
    </Stack>
  );
}
```

**Poin demonstrasi**: `<Stack.Screen>` mengatur `options` judul tiap layar + gestur back + animasi push/pop.

## 4. Menjawab Pertanyaan — 📝 (15%) SIAP-SIAP

Jawaban siap pakai yang bisa dipakai (sesuaikan pertanyaan modul):

**Q: Apa beda `useState` dan `useEffect`?**
`useState` menyimpan state komponen dan memicu re-render saat diubah. `useEffect` menjalankan efek samping (fetch API, timer, listener) di sisi berrender.

**Q: Kapan `useEffect` dijalankan?**
Sesuai array dependensi: `[]` sekali saat mount, `[x]` saat nilai `x` berubah, tanpa array setiap re-render. Laporan fetch terjaga `useEffect(() => {...}, [user])`.

**Q: Beda `router.push`, `router.back`, dan `router.replace`?**
`push` menambahkan rute ke stack, `back` pop satu rute (mirip tombol hardware back), `replace` mengganti rute aktif tanpa menambah jejak history (dipakai setelah submit laporan agar tidak kembali ke form).

**Q: Kenapa pakai `_layout` dan `<Stack.Screen>`?**
`_layout` adalah "kerangka" navigasi yang mendawasi semua rute; `<Stack.Screen>` menyesuaikan konfigurasi per-layar (judul, warna header) tanpa mengubah kode layar.

**Q: Kenapa aplikasi tidak crash saat API error / offline?**
Semua fetch dibungkus `try/catch` di `apiClient.js` dan error dikategorikan (`kategoriError`): offline/4xx/5xx masing-masing dengan pesan & tombol *Retry* terpisah.

## 5. Menyelesaikan Modifikasi Kode — ✅ (15%) SUDAH BANYAK

- 🗺️ Peta OSM Malang (pin laporan, ubah status dari peta), dan pilih titik lokasi saat membuat laporan.
- ✅ Update status `Dilaporkan → Diverifikasi → Dikerjakan → Selesai` (tombol aksi cepat + modal + peta).
- 🧪 Handle API error (2xx/4xx/5xx/network) + loading–error–retry + banner offline otomatis.
- 🎨 Restyle palet indigo–violet di `theme.js`.
- Detail: baca `CATATAN-TUGAS.md`.

---

## Ringkasan status
- ✅ Sudah aman: `useState`/`useEffect` (10%) + Modifikasi (15%) = **25%**
- ⬜ Sisa kerja: migrasi `expo-router` (`push`/`back` + 1 fungsi + `_layout`/`Stack.Screen`) = **20%**
- 📝 Menjawab pertanyaan: gunakan bagian 4 (jawaban siap pakai) = **15%**
