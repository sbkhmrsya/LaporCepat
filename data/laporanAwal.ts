// Data laporan awal (contoh). Laporan baru dari form akan ditambahkan di atasnya.
import type { LaporanProps } from './models';

export const laporanAwal: Partial<LaporanProps>[] = [
  { id: '1', judul: 'Lampu Jalan Mati', lokasi: 'Jl. Merdeka No. 12', status: 'Diverifikasi', emoji: '💡' },
  { id: '2', judul: 'Jalan Berlubang', lokasi: 'Depan Gang Mawar', status: 'Dikerjakan', emoji: '🕳️' },
  { id: '3', judul: 'Saluran Air Tersumbat', lokasi: 'RT 04 / RW 02', status: 'Dilaporkan', emoji: '🌊' },
];
