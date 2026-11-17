import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReportList from '../components/ReportList';
import { colors, statusStyle } from '../theme';
import { confirmDialog } from '../utils/dialog';
import type { Laporan, StatusLaporan } from '../services/laporanApi';

const FILTERS: Array<'Semua' | StatusLaporan> = [
  'Semua', 'Dilaporkan', 'Diverifikasi', 'Dikerjakan', 'Selesai', 'Ditolak',
];

export default function RiwayatScreen({ laporan = [], onBack = () => {}, onDelete = null, onUpdateStatus = null }: {
  laporan?: Laporan[];
  onBack?: () => void;
  onDelete?: ((id: string | number | null) => Promise<unknown>) | null;
  onUpdateStatus?: ((id: string | number | null, status: StatusLaporan) => Promise<unknown>) | null;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'Semua' | StatusLaporan>('Semua');

  const tampil = filter === 'Semua' ? laporan : laporan.filter((x) => x.status === filter);
  const jumlahSelesai = laporan.filter((x) => x.status === 'Selesai').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient colors={colors.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Kembali">
          <Ionicons name="arrow-back" size={21} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Riwayat Laporan</Text>
          <Text style={styles.headerSub}>{laporan.length} total laporan • {jumlahSelesai} selesai</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="time" size={13} color="#DDD6FE" />
          <Text style={styles.pillText}>SEMUA STATUS</Text>
        </View>
      </LinearGradient>

      {/* FILTER STATUS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
        {FILTERS.map((s) => {
          const aktif = filter === s;
          return (
            <Pressable
              key={s}
              onPress={() => setFilter(s)}
              style={[styles.filterChip, aktif && styles.filterChipOn]}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${s}`}
              accessibilityState={{ selected: aktif }}
            >
              {s !== 'Semua' && <View style={[styles.filterDot, { backgroundColor: statusStyle[s].dot }]} />}
              <Text style={[styles.filterText, aktif && styles.filterTextOn]}>{s}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* DAFTAR */}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ReportList
          isLayarLebar={false}
          laporan={tampil}
          onUpdateStatus={onUpdateStatus}
          onDelete={
            onDelete
              ? async (id) => {
                  const ok = await confirmDialog('Hapus laporan?', 'Laporan ini akan dihapus secara permanen.', 'Hapus');
                  if (ok) onDelete(id);
                }
              : null
          }
          onDetail={null}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, zIndex: 20 },
  back: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12.5, color: '#DDD6FE', marginTop: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { fontSize: 9.5, fontWeight: '900', color: '#fff', letterSpacing: 0.8 },
  filterScroll: { marginHorizontal: 16, marginTop: 12, flexGrow: 0, zIndex: 15 },
  filters: { gap: 8, paddingRight: 16 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 38, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  filterChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterDot: { width: 7, height: 7, borderRadius: 4 },
  filterText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  filterTextOn: { color: '#fff' },
  body: { padding: 18, paddingBottom: 8 },
});
