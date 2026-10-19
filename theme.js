// ============================================================
// DESIGN SYSTEM LaporCepat — token terpusat.
// Warna, radius, shadow, dan status dipakai semua layar agar
// tampil konsisten seperti aplikasi produksi.
// ============================================================
export const colors = {
  primary: '#EA580C',
  primaryDark: '#C2410C',
  primaryLight: '#FFF1E6',
  primaryGradient: ['#F97316', '#EA580C', '#C2410C'],
  ink: '#1C1917',
  text: '#1C1917',
  muted: '#78716C',
  placeholder: '#A8A29E',
  bg: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E9E5DE',
  line: '#F1EDE6',
  tint: '#FFF1E6',
  tintBorder: '#FFD9BD',
  dark: '#1E293B',
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
    shadowColor: '#1C1917',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pop: {
    shadowColor: '#EA580C',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
};

export const statusStyle = {
  Dilaporkan: { bg: '#FFE4D6', text: '#C2410C', dot: '#EA580C' },
  Diverifikasi: { bg: '#FEF3C7', text: '#B45309', dot: '#D97706' },
  Dikerjakan: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB' },
  Selesai: { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' },
};

export const categoryMeta = {
  '💡': { icon: 'bulb', bg: '#FEF3C7', fg: '#B45309' },
  '🕳️': { icon: 'construct', bg: '#E0E7FF', fg: '#4338CA' },
  '🌊': { icon: 'water', bg: '#DBEAFE', fg: '#1D4ED8' },
  '🗑️': { icon: 'trash', bg: '#FCE7F3', fg: '#BE185D' },
};
