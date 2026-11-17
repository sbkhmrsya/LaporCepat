// Helper waktu relatif dalam Bahasa Indonesia.
// Dipakai untuk menampilkan "x menit lalu" seperti aplikasi produksi.
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function waktuRelatif(ts: number | string | null | undefined): string {
  if (!ts) return 'Baru saja';
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return 'Baru saja';

  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  const j = Math.floor(m / 60);
  if (j < 24) return `${j} jam lalu`;
  const h = Math.floor(j / 24);
  if (h < 7) return h === 1 ? 'Kemarin' : `${h} hari lalu`;

  const d = new Date(t);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function salamSesuaiWaktu(): string {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return 'Selamat pagi';
  if (h >= 11 && h < 15) return 'Selamat siang';
  if (h >= 15 && h < 18) return 'Selamat sore';
  return 'Selamat malam';
}
