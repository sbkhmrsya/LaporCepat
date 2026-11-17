// ============================================================
// MODUL 3 — util delay bersama.
// Sebelumnya tiap service punya duplikat delay lokal; sekarang
// semua (laporanApi, userApi, dst.) import dari sini.
// ============================================================

/**
 * Custom async helper: mengembalikan Promise<void> yang selesai
 * setelah `ms` milidetik. Memakai setTimeout bawaan (pre-built).
 */
export function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    // pre-built async function (setTimeout) — resolve() dipanggil saat timer selesai.
    setTimeout(() => resolve(), ms);
  });
}
