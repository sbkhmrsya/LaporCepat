import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// ============================================================
// REPORT LIST — daftar laporan prioritas
// Task 01: Content Section
// Task 02: Responsive (jumlah kolom menyesuaikan lebar layar)
// Task 03: Accessibility (label deskriptif per kartu, touch target)
// ============================================================

const laporanPrioritas = [
  { id: '1', judul: 'Lampu Jalan Mati', lokasi: 'Jl. Merdeka No. 12', status: 'Diverifikasi', emoji: '💡' },
  { id: '2', judul: 'Jalan Berlubang', lokasi: 'Depan Gang Mawar', status: 'Dikerjakan', emoji: '🕳️' },
  { id: '3', judul: 'Saluran Air Tersumbat', lokasi: 'RT 04 / RW 02', status: 'Dilaporkan', emoji: '🌊' },
];

const statusColor = {
  Diverifikasi: { bg: '#FEF3C7', text: '#B45309' },
  Dikerjakan: { bg: '#DBEAFE', text: '#1D4ED8' },
  Dilaporkan: { bg: '#FFE4D6', text: '#C2410C' },
};

export default function ReportList({ isLayarLebar }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Laporan Prioritas</Text>
      <View
        style={[
          styles.cardList,
          { flexDirection: isLayarLebar ? 'row' : 'column', flexWrap: 'wrap' },
        ]}
      >
        {laporanPrioritas.map((item) => {
          const warna = statusColor[item.status] || { bg: '#F1F5F9', text: '#475569' };
          return (
            <Pressable
              key={item.id}
              style={[styles.reportCard, { width: isLayarLebar ? '31%' : '100%' }]}
              accessible={true}
              accessibilityLabel={`Laporan: ${item.judul}, lokasi ${item.lokasi}, status ${item.status}`}
              accessibilityRole="button"
              accessibilityHint="Membuka detail laporan"
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.reportTitle}>{item.judul}</Text>
              <Text style={styles.reportLocation}>{item.lokasi}</Text>
              <View style={[styles.statusBadge, { backgroundColor: warna.bg }]}>
                <Text style={[styles.statusText, { color: warna.text }]}>{item.status}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  cardList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE0C7',
    minHeight: 44,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 22,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 13,
    color: '#78716C',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
