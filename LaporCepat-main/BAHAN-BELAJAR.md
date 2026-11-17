# Bahan Belajar (versi sederhana) — Data Pengguna dari JSONPlaceholder

> Ketik kode di bawah **secara manual**, urut dari Langkah 1.
> Setelah tiap langkah: `npm run typecheck` (harus tanpa error).

Soal:
1. Buat halaman baru.
2. Ambil data dari `https://jsonplaceholder.typicode.com/users`.
3. Beri validasi connect / tidak connect.
4. Fetching untuk mengambil: **nama, website, email**.

Urutan alurnya persis seperti soal:
**fetch data API → cek connect / tidak connect → ambil field nama, website, email.**

File yang disentuh:

```
types/pengguna.ts           (BARU)
services/penggunaApi.ts     (BARU)
screens/PenggunaScreen.tsx  (BARU)
screens/HomeScreen.tsx      (EDIT — 1 baris)
App.tsx                     (EDIT — impor + cabang rute)
screens/ProfilScreen.tsx    (EDIT — 1 menu)
```

---

## Langkah 1 — `types/pengguna.ts` (file baru)

Buka dulu URL API di browser, lihat bentuk datanya (array berisi object user
dengan field `name`, `email`, `website`, dll). Soal cuma minta 3 field, jadi
interface-nya cukup ini:

```ts
export interface Pengguna {
  nama: string;
  email: string;
  website: string;
}
```

---

## Langkah 2 — `services/penggunaApi.ts` (file baru)

```ts
import type { Pengguna } from '../types/pengguna';

const URL_API = 'https://jsonplaceholder.typicode.com/users';

// (soal 2) ambil data API -> (soal 4) ambil field nama, email, website
export function ambilPengguna(): Promise<Pengguna[]> {
  return new Promise((resolve, reject) => {
    fetch(URL_API)
      .then((res) => res.json())                     // (2) data API didapat
      .then((data: any[]) => {
        // (4) "fetching" 3 field yang diminta soal
        const hasil = data.map((u) => ({
          nama: u.name,
          email: u.email,
          website: u.website,
        }));
        resolve(hasil);                              // janji selesai, kirim hasil
      })
      .catch(() => {
        // internet mati / request gagal -> janji ditolak
        reject(new Error('Tidak terhubung ke internet'));
      });
  });
}
```

Yang harus paham:
- `new Promise((resolve, reject))` = kita bikin "janji" sendiri.
- `resolve(hasil)` = sukses, kirim datanya.
- `reject(new Error(...))` = gagal, kirim alasannya.
- `.map()` = mengambil hanya `name → nama`, `email`, `website`
  dari 10 user, sisanya dibuang.

---

## Langkah 3 — `screens/PenggunaScreen.tsx` (file baru)

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme';
import { useConnectivity } from '../services/connectivity';
import { ambilPengguna } from '../services/penggunaApi';
import type { Pengguna } from '../types/pengguna';

export default function PenggunaScreen({ onBack = () => {} }: {
  onBack?: () => void;
}): React.JSX.Element {
  const online = useConnectivity();          // (3) true = connect, false = tidak connect
  const [data, setData] = useState<Pengguna[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const muat = (): void => {
    setLoading(true);
    setError('');
    ambilPengguna()
      .then((hasil) => setData(hasil))       // sukses -> simpan data
      .catch((e) => setError(e.message))     // gagal  -> simpan pesan error
      .finally(() => setLoading(false));     // selalu -> matikan loading
  };

  // (3) validasi: connect -> fetch, tidak connect -> tampilkan pesan saja
  useEffect(() => {
    if (online) {
      muat();
    } else {
      setError('Tidak terhubung internet');
      setLoading(false);
    }
  }, [online]); // otomatis jalan lagi saat status internet berubah

  return (
    <ScrollView style={styles.container}>
      <Pressable onPress={onBack}><Text style={styles.back}>‹ Kembali</Text></Pressable>
      <Text style={styles.judul}>Data Pengguna</Text>

      <Text style={[styles.status, { color: online ? colors.success : colors.danger }]}>
        {online ? 'Status: Terhubung internet' : 'Status: Tidak terhubung internet'}
      </Text>

      {loading ? (
        <Text style={styles.teks}>Memuat data…</Text>
      ) : error ? (
        <View>
          <Text style={[styles.teks, { color: colors.danger }]}>{error}</Text>
          {online && (
            <Pressable style={styles.tombol} onPress={muat}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Coba Lagi</Text>
            </Pressable>
          )}
        </View>
      ) : (
        data.map((u) => (
          <View key={u.email} style={styles.kartu}>
            <Text style={styles.nama}>{u.nama}</Text>
            <Text style={styles.teks}>{u.email}</Text>
            <Text style={styles.teks}>{u.website}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 18, gap: 10 },
  back: { color: colors.primary, fontWeight: '700', marginBottom: 6 },
  judul: { fontSize: 20, fontWeight: '900', color: colors.text },
  status: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  kartu: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 2 },
  nama: { fontSize: 15, fontWeight: '800', color: colors.text },
  teks: { fontSize: 13, color: colors.muted },
  tombol: { backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: 'center', alignSelf: 'flex-start' },
});
```

Logika layar, sesuai urutan soal:
- Status koneksi tampil di atas: hijau "Terhubung" / merah "Tidak terhubung".
- **Connect** → fetch data → tampil 10 pengguna.
- **Tidak connect** → TIDAK fetch, langsung pesan "Tidak terhubung internet".
- Saat internet kembali online, `useEffect([online])` otomatis memuat data lagi.
- Data tidak pernah tampil saat error.

---

## Langkah 4 — daftarkan halamannya (3 tempat kecil)

**(a) `screens/HomeScreen.tsx`** — cari `export type AppScreen`, tambah `'pengguna'`:
```tsx
export type AppScreen = 'home' | 'peta' | 'buat' | 'profil' | 'riwayat' | 'pengguna';
```

**(b) `App.tsx`** — impor di atas:
```tsx
import PenggunaScreen from './screens/PenggunaScreen';
```
lalu tambah cabang di dalam `Root` (sebaris dengan cabang `peta`/`riwayat`):
```tsx
if (screen === 'pengguna') {
  return (
    <ScreenTransition>
      <PenggunaScreen onBack={() => setScreen('home')} />
    </ScreenTransition>
  );
}
```

**(c) `screens/ProfilScreen.tsx`** — pintu masuk. Tambah prop:
```tsx
onPengguna = () => {}
```
di deklarasi props (dan `onPengguna?: () => void;` di tipenya), lalu satu menu
di grup "Lainnya" (setelah MenuRow "Riwayat laporanku"):
```tsx
<MenuRow icon="people" tint="#DCFCE7" fg="#15803D"
  title="Data Pengguna (API)" desc="Demo fetch JSONPlaceholder"
  onPress={onPengguna} />
```
dan di `App.tsx`, pada `<ProfilScreen ... />` tambahkan:
```tsx
onPengguna={() => setScreen('pengguna')}
```

---

## Uji mandiri

1. `npm run typecheck` — tanpa error.
2. Profil → "Data Pengguna (API)" → status "Terhubung internet" + 10 pengguna tampil.
3. Matikan internet → status berubah "Tidak terhubung internet" + pesan error muncul,
   daftar hilang.
4. Nyalakan internet → halaman otomatis memuat lagi (karena `useEffect` mengikuti `online`).
