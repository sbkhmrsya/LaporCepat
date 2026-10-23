import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapViewLeaflet, { PUSAT_MALANG } from '../components/MapViewLeaflet';
import { colors, shadow, statusStyle, radius } from '../theme';

// ============================================================
// PETA LAPORAN (SUNGGUHAN) — memakai OpenStreetMap + Leaflet.
// Terpusat di Malang, Jawa Timur. Laporan TANPA koordinat (dari
// mock/form lama) diberi titik pseudo-GPS deterministik di sekitar
// Malang; laporan dengan lat/lng dari backend dipetakan apa adanya.
// Tap pin -> kartu detail + ubah status cepat.
// ============================================================
const STATUS_FILTER = ['Semua', 'Dilaporkan', 'Diverifikasi', 'Dikerjakan', 'Selesai'];

function hashStr(s) {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

// Sebaran pseudo-GPS: ±0.045° lat, ±0.07° lng di sekitar kota Malang.
function koordinatDariLaporan(item) {
  if (item?.lat != null && item?.lng != null) {
    return { lat: Number(item.lat), lng: Number(item.lng) };
  }
  const h = hashStr(`${item.lokasi || item.judul || ''}`);
  const lat = PUSAT_MALANG.lat + ((h % 1000) / 1000 - 0.5) * 0.09;
  const lng = PUSAT_MALANG.lng + (((h >> 5) % 1000) / 1000 - 0.5) * 0.14;
  return { lat, lng };
}

export default function MapScreen({ laporan = [], onBack = () => {}, onUpdateStatus = null }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('Semua');
  const [terpilih, setTerpilih] = useState(null);

  const tampil = useMemo(
    () => (filter === 'Semua' ? laporan : laporan.filter((x) => x.status === filter)),
    [laporan, filter],
  );

  // Titik-titik untuk peta (memo agar PostMessage tidak spam).
  const markers = useMemo(
    () => tampil.map((item) => {
      const st = statusStyle[item.status] || { bg: '#E4E8FE', text: '#4338CA', dot: colors.primary };
      const pos = koordinatDariLaporan(item);
      return {
        id: item.id, lat: pos.lat, lng: pos.lng,
        emoji: item.emoji || '📍', title: item.judul,
        bg: st.bg, fg: st.dot,
      };
    }),
    [tampil],
  );

  const pilih = useCallback((id) => {
    const item = laporan.find((x) => String(x.id) === String(id));
    if (!item) return;
    setTerpilih((lama) => (lama && String(lama.id) === String(item.id) ? null : item));
  }, [laporan]);

  const ubahStatus = useCallback(async (item, status) => {
    if (!onUpdateStatus) return;
    try {
      await onUpdateStatus(item.id, status);
      setTerpilih(null);
    } catch {
      // Error ditangani layer state; kartu dibiarkan terbuka.
    }
  }, [onUpdateStatus]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient colors={colors.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Kembali">
          <Ionicons name="arrow-back" size={21} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Peta Laporan</Text>
          <Text style={styles.headerSub}>{tampil.length} laporan • Malang, Jawa Timur</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>OSM LIVE</Text>
        </View>
      </LinearGradient>

      {/* FILTER STATUS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
        {STATUS_FILTER.map((s) => {
          const aktif = filter === s;
          return (
            <Pressable
              key={s}
              onPress={() => { setFilter(s); setTerpilih(null); }}
              style={[styles.filterChip, aktif && styles.filterChipOn]}
              accessibilityRole="button"
              accessibilityLabel={`Filter status ${s}`}
              accessibilityState={{ selected: aktif }}
            >
              {s !== 'Semua' && <View style={[styles.filterDot, { backgroundColor: statusStyle[s].dot }]} />}
              <Text style={[styles.filterText, aktif && styles.filterTextOn]}>{s}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* PETA SUNGGUHAN */}
      <View style={[styles.mapWrap, shadow.card]}>
        <MapViewLeaflet
          center={PUSAT_MALANG}
          zoom={13}
          markers={markers}
          aktifId={terpilih?.id || null}
          onMarkerPress={pilih}
        />
      </View>

      {/* KARTU DETAIL + UBAH STATUS CEPAT */}
      {terpilih ? (
        <View style={[styles.sheet, shadow.pop]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.sheetIcon, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 22 }}>{terpilih.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle} numberOfLines={1}>{terpilih.judul}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-outline" size={13} color={colors.muted} />
                <Text style={styles.sheetLoc} numberOfLines={1}>
                  {terpilih.lokasi}
                  {terpilih.lat != null ? ` (${Number(terpilih.lat).toFixed(4)}, ${Number(terpilih.lng).toFixed(4)})` : ''}
                </Text>
              </View>
            </View>
            <Pressable onPress={() => setTerpilih(null)} hitSlop={8} accessibilityLabel="Tutup detail pin">
              <Ionicons name="close-circle" size={22} color={colors.placeholder} />
            </Pressable>
          </View>
          <Text style={styles.statusLabel}>Ubah status laporan:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {Object.keys(statusStyle).map((s) => {
              const st = statusStyle[s];
              const on = terpilih.status === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => ubahStatus(terpilih, s)}
                  disabled={!onUpdateStatus || on}
                  style={[styles.statusChip, { backgroundColor: on ? st.dot : st.bg }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Ubah status menjadi ${s}`}
                >
                  <View style={[styles.statusDot, { backgroundColor: on ? '#fff' : st.dot }]} />
                  <Text style={[styles.statusText, on && styles.statusTextOn]}>{s}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.hintBar}>
          <Ionicons name="albums-outline" size={16} color={colors.primary} />
          <Text style={styles.hintText}>Geser &amp; zoom peta • tap pin untuk detail laporan</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, zIndex: 20 },
  back: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12.5, color: '#DDD6FE', marginTop: 2 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  liveText: { fontSize: 10.5, fontWeight: '900', color: '#fff', letterSpacing: 0.8 },
  filterScroll: { marginHorizontal: 16, marginTop: 12, flexGrow: 0, zIndex: 15 },
  filters: { gap: 8, paddingRight: 16 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 38, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  filterChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterDot: { width: 7, height: 7, borderRadius: 4 },
  filterText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  filterTextOn: { color: '#fff' },
  mapWrap: { flex: 1, margin: 16, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, zIndex: 10 },
  sheet: { margin: 16, marginTop: 0, backgroundColor: '#fff', borderRadius: 18, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.line },
  sheetIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  sheetLoc: { fontSize: 12.5, color: colors.muted, flexShrink: 1 },
  statusLabel: { fontSize: 11.5, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 38, borderRadius: 999 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12.5, fontWeight: '800', color: colors.text },
  statusTextOn: { color: '#fff' },
  hintBar: { margin: 16, marginTop: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primaryLight, borderRadius: 14, minHeight: 44, borderWidth: 1, borderColor: colors.tintBorder },
  hintText: { fontSize: 12.5, color: colors.primaryDark, fontWeight: '700' },
});
