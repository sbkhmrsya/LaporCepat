// ============================================================
// DESIGN SYSTEM LaporCepat — token terpusat.
// Warna, radius, shadow, dan status dipakai semua layar agar
// tampil konsisten seperti aplikasi produksi.
// Palet v2: indigo–violet modern dengan netral sejuk (cool gray).
// ============================================================
export const colors = {
  primary: '#6D5EF8',
  primaryDark: '#4338CA',
  primaryLight: '#EEF0FE',
  primaryGradient: ['#8B5CF6', '#6D5EF8', '#4338CA'],
  ink: '#171B2E',
  text: '#171B2E',
  muted: '#666D8A',
  placeholder: '#9CA3C0',
  bg: '#F3F4FB',
  card: '#FFFFFF',
  border: '#E4E6F2',
  line: '#EEF0F8',
  tint: '#EEF0FE',
  tintBorder: '#D6DAFC',
  dark: '#1E1B4B',
  success: '#16A34A',
  successBg: '#DCFCE7',
  info: '#2563EB',
  infoBg: '#DBEAFE',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  danger: '#B91C1C',
  dangerBg: '#FEE2E2',
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, full: 999 };

export const shadow = {
  card: {
    shadowColor: '#2B2F55',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pop: {
    shadowColor: '#6D5EF8',
    shadowOpacity: 0.32,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
};

export const statusStyle = {
  Dilaporkan: { bg: '#E4E8FE', text: '#4338CA', dot: '#6D5EF8' },
  Diverifikasi: { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' },
  Dikerjakan: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  Selesai: { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  Ditolak: { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
};

export const categoryMeta = {
  '💡': { icon: 'bulb', bg: '#FEF3C7', fg: '#B45309' },
  '🕳️': { icon: 'construct', bg: '#E0E7FF', fg: '#4338CA' },
  '🌊': { icon: 'water', bg: '#CFFAFE', fg: '#0E7490' },
  '🗑️': { icon: 'trash', bg: '#FCE7F3', fg: '#BE185D' },
};
