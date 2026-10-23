import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import ReportList from '../components/ReportList';
import OfflineBanner from '../components/OfflineBanner';
import { SkeletonLoader, SkeletonCard } from '../components/SkeletonLoader';
import { colors, shadow } from '../theme';
import { notify, confirmDialog } from '../utils/dialog';
import { kategoriError, PESAN_API } from '../services/apiClient';
import { isMockMode, MODE_SIMULASI, getSimulasi, setSimulasi } from '../services/laporanApi';

// ============================================================
// HOME MODERN — header, search, banner gradasi, statistik,
// filter kategori, daftar laporan, bottom-nav ala aplikasi asli.
// ============================================================
const FILTERS = [
  { id: 'semua', label: 'Semua', icon: 'apps' },
  { id: '💡', label: 'Lampu', icon: 'bulb' },
  { id: '🕳️', label: 'Jalan', icon: 'construct' },
  { id: '🌊', label: 'Air', icon: 'water' },
  { id: '🗑️', label: 'Sampah', icon: 'trash' },
];

export default function HomeScreen({
  laporan = [], onNavigate = () => {}, loading = false,
  error = '', onRefresh = () => {}, onDelete = async () => {},
  onUpdateStatus = null,
}) {
  const { width } = useWindowDimensions();
  const isLayarLebar = width >= 600;
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('semua');
  const [mencoba, setMencoba] = useState(false);   // TASK 02: feedback saat retry ditekan
  const [modeUji, setModeUji] = useState(getSimulasi());

  // TASK 02: retry — tombol "Coba Lagi" memicu request ulang.
  const cobaLagi = async () => {
    setMencoba(true);
    try { await onRefresh(); } finally { setMencoba(false); }
  };

  // Simulator kondisi API (hanya mode mock) — practical demo TASK 01..03.
  const pakaiModeUji = isMockMode();
  const gantiModeUji = (m) => {
    setSimulasi(m);
    setModeUji(m);
    notify('Uji API', MODE_SIMULASI.find((x) => x.id === m)?.label || m);
    setMencoba(true);
    onRefresh().finally(() => setMencoba(false));
  };

  const stats = useMemo(() => ({
    total: laporan.length,
    diverifikasi: laporan.filter((x) => x.status === 'Diverifikasi').length,
    dikerjakan: laporan.filter((x) => x.status === 'Dikerjakan').length,
  }), [laporan]);

  const tampil = useMemo(() => {
    const q = query.trim().toLowerCase();
    return laporan.filter((x) => {
      const cocokFilter = filter === 'semua' || x.emoji === filter;
      const cocokQuery = !q || x.judul.toLowerCase().includes(q) || x.lokasi.toLowerCase().includes(q);
      return cocokFilter && cocokQuery;
    });
  }, [laporan, query, filter]);

  return (
    <View style={styles.container}>
      <Header
        onBell={() => notify('Notifikasi', 'Belum ada notifikasi baru. Laporanmu akan muncul di sini.')}
        onAvatar={() => onNavigate('profil')}
      />
      {/* TASK 03: banner otomatis saat internet terputus */}
      <OfflineBanner />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* SEARCH */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={19} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari laporan / lokasi…"
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Cari laporan"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Hapus pencarian">
              <Ionicons name="close-circle" size={19} color={colors.placeholder} />
            </Pressable>
          ) : (
            <Pressable
              style={styles.searchFilter}
              onPress={() => notify('Filter', 'Gunakan chip kategori di bawah untuk memfilter.')}
              accessibilityLabel="Filter pencarian"
            >
              <Ionicons name="options-outline" size={18} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {/* HERO BANNER */}
        <LinearGradient colors={colors.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroDeco1} />
          <View style={styles.heroDeco2} />
          <View style={{ flex: 1 }}>
            <View style={styles.heroPill}>
              <Ionicons name="flash" size={12} color="#C7BFFF" />
              <Text style={styles.heroPillText}>Respon cepat • Transparan</Text>
            </View>
            <Text style={styles.heroTitle}>Lapor Kerusakan,{'\n'}Pantau Perbaikan</Text>
            <Text style={styles.heroSub}>Foto, laporkan, dan pantau fasilitas umum di lingkunganmu.</Text>
            <View style={styles.heroBtns}>
              <Pressable
                style={({ pressed }) => [styles.heroPrimary, pressed && { opacity: 0.85 }]}
                onPress={() => onNavigate('buat')}
                accessibilityRole="button" accessibilityLabel="Buat laporan baru"
              >
                <Ionicons name="add-circle" size={19} color={colors.primary} />
                <Text style={styles.heroPrimaryText}>Buat Laporan</Text>
              </Pressable>
              <Pressable
                style={styles.heroGhost}
                onPress={onRefresh}
                accessibilityRole="button" accessibilityLabel="Muat ulang laporan"
              >
                <Ionicons name="refresh" size={17} color="#fff" />
              </Pressable>
            </View>
          </View>
          {!isLayarLebar && (
            <View style={styles.heroArt}>
              <View style={styles.heroArtCircle}>
                <Ionicons name="construct" size={44} color="#fff" />
              </View>
              <View style={styles.heroMini}>
                <Ionicons name="checkmark-circle" size={15} color="#4ADE80" />
                <Text style={styles.heroMiniText}>Terverifikasi</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* STATS */}
        <View style={styles.stats}>
          <Stat icon="layers" value={stats.total} label="Total" tint={colors.primaryLight} fg={colors.primary} />
          <Stat icon="shield-checkmark" value={stats.diverifikasi} label="Diverifikasi" tint="#FEF3C7" fg="#B45309" />
          <Stat icon="hammer" value={stats.dikerjakan} label="Dikerjakan" tint="#DBEAFE" fg="#1D4ED8" />
        </View>

        {/* FILTER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipScroll}>
          {FILTERS.map((f) => {
            const aktif = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.chip, aktif && styles.chipAktif, aktif && shadow.pop]}
                accessibilityRole="button" accessibilityLabel={`Filter ${f.label}`}
                accessibilityState={{ selected: aktif }}
              >
                <Ionicons name={f.icon} size={16} color={aktif ? '#fff' : colors.muted} />
                <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* MODE UJI API (hanya mock) — demo TASK 01-03 */}
        {pakaiModeUji && (
          <View style={styles.ujiBox}>
            <View style={styles.ujiHead}>
              <Ionicons name="flask-outline" size={15} color={colors.primary} />
              <Text style={styles.ujiTitle}>Uji Kondisi API</Text>
              <Text style={styles.ujiSub}>Simulasikan respon server</Text>
            </View>
            <View style={styles.ujiChips}>
              {MODE_SIMULASI.map((m) => {
                const aktif = modeUji === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => gantiModeUji(m.id)}
                    style={[styles.ujiChip, aktif && styles.ujiChipOn]}
                    accessibilityRole="button"
                    accessibilityLabel={`Simulasi ${m.label}`}
                    accessibilityState={{ selected: aktif }}
                  >
                    <Ionicons name={m.icon} size={13} color={aktif ? '#fff' : colors.muted} />
                    <Text style={[styles.ujiChipText, aktif && styles.ujiChipTextOn]}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* TASK 01-03: STATE LIST — loading / error / retry */}
        {loading && laporan.length === 0 ? (
          <View style={styles.stateBox}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <Text style={styles.stateText}>
              {mencoba ? 'Mencoba lagi…\nMengambil data terbaru.' : 'Memuat data…\nMohon tunggu sebentar.'}
            </Text>
          </View>
        ) : error && laporan.length === 0 ? (
          (() => {
            // TASK 01: beda tampilan untuk offline / 404 / 5xx / lainnya.
            const jenis = kategoriError(typeof error === 'string' ? null : error);
            const pesan = typeof error === 'string' ? error : error?.message || PESAN_API.gagal;
            const meta = {
              offline:  { icon: 'cloud-offline-outline', bg: colors.dangerBg,  fg: colors.danger },
              notfound: { icon: 'search-outline',        bg: colors.warningBg, fg: colors.warning },
              server:   { icon: 'server-outline',        bg: colors.dangerBg,  fg: colors.danger },
              timeout:  { icon: 'time-outline',          bg: colors.warningBg, fg: colors.warning },
            }[jenis] || { icon: 'alert-circle-outline', bg: colors.dangerBg, fg: colors.danger };
            return (
              <View style={styles.stateBox}>
                <View style={[styles.errIcon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={28} color={meta.fg} />
                </View>
                <Text style={styles.stateText}>{pesan}</Text>
                <Pressable style={styles.retry} onPress={cobaLagi} accessibilityRole="button" accessibilityLabel="Coba lagi">
                  <Ionicons name="refresh" size={17} color="#fff" />
                  <Text style={styles.retryText}>Coba Lagi</Text>
                </Pressable>
              </View>
            );
          })()
        ) : (
          <ReportList
            isLayarLebar={isLayarLebar}
            laporan={tampil}
            onUpdateStatus={onUpdateStatus}
            onDelete={async (id) => {
              const ok = await confirmDialog('Hapus laporan?', 'Laporan ini akan dihapus secara permanen.', 'Hapus');
              if (ok) onDelete(id);
            }}
            onDetail={(item) => notify('Detail', `${item.judul}\n${item.lokasi}\nStatus: ${item.status}`)}
          />
        )}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={[styles.nav, { paddingBottom: 10 + insets.bottom }]}>
        <NavItem icon="home" label="Beranda" active onPress={() => {}} />
        <NavItem icon="map-outline" label="Peta" onPress={() => onNavigate('peta')} />
        <View style={styles.fabWrap}>
          <Pressable
            style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
            onPress={() => onNavigate('buat')}
            accessibilityRole="button" accessibilityLabel="Buat laporan"
          >
            <Ionicons name="add" size={30} color="#fff" />
          </Pressable>
          <Text style={styles.fabLabel}>Lapor</Text>
        </View>
        <NavItem icon="time-outline" label="Riwayat" onPress={() => notify('Riwayat', 'Semua laporanmu tampil di daftar atas.')} />
        <NavItem icon="person-outline" label="Profil" onPress={() => onNavigate('profil')} />
      </View>
    </View>
  );
}

function Stat({ icon, value, label, tint, fg }) {
  return (
    <View style={[styles.stat, shadow.card]}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={19} color={fg} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NavItem({ icon, label, active, onPress }) {
  return (
    <Pressable style={styles.navItem} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={active ? icon.replace('-outline', '') : icon} size={24} color={active ? colors.primary : '#A6ACC9'} />
      <Text style={[styles.navLabel, active && styles.navLabelAktif]}>{label}</Text>
      {active && <View style={styles.navDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 18, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff',
    borderRadius: 16, paddingHorizontal: 15, minHeight: 52,
    borderWidth: 1, borderColor: '#E7E9F4', ...shadow.card, marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10 },
  searchFilter: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 26, padding: 20, marginBottom: 16, overflow: 'hidden', flexDirection: 'row', gap: 12, minHeight: 196 },
  heroDeco1: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.12)', top: -70, right: -50 },
  heroDeco2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,0,0,0.10)', bottom: -50, left: 60 },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.22)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginBottom: 10 },
  heroPillText: { fontSize: 11, fontWeight: '700', color: '#DDD6FE', letterSpacing: 0.3 },
  heroTitle: { fontSize: 23, fontWeight: '900', color: '#fff', lineHeight: 29, marginBottom: 6 },
  heroSub: { fontSize: 13, color: '#DDD6FE', lineHeight: 18, marginBottom: 14, maxWidth: 220 },
  heroBtns: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroPrimary: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fff', paddingHorizontal: 17, minHeight: 46, borderRadius: 14 },
  heroPrimaryText: { fontSize: 14.5, fontWeight: '800', color: colors.primaryDark },  heroGhost: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  heroArt: { justifyContent: 'center', alignItems: 'center', width: 104 },
  heroArtCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  heroMini: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, marginTop: 10 },
  heroMiniText: { fontSize: 11, fontWeight: '800', color: colors.text },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: '#EAECF7' },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 19, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 11.5, color: colors.muted, fontWeight: '600', marginTop: 1 },
  chipScroll: { marginHorizontal: -18, marginVertical: 12 },
  chips: { paddingHorizontal: 18, gap: 9, paddingVertical: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, minHeight: 40, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E9F4' },
  chipAktif: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13.5, fontWeight: '700', color: colors.muted },
  chipTextAktif: { color: '#fff' },
  stateBox: { alignItems: 'center', paddingVertical: 36, gap: 12 },
  stateText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  ujiBox: { backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E7E9F4', marginBottom: 14, ...shadow.card },
  ujiHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 9, flexWrap: 'wrap' },
  ujiTitle: { fontSize: 12.5, fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.6 },
  ujiSub: { fontSize: 11.5, color: colors.placeholder, fontWeight: '600' },
  ujiChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ujiChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 36, borderRadius: 999, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  ujiChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  ujiChipText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  ujiChipTextOn: { color: '#fff' },
  errIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center' },
  retry: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.primary, paddingHorizontal: 20, minHeight: 46, borderRadius: 13, ...shadow.pop },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  nav: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row',
    justifyContent: 'space-around', alignItems: 'flex-end',
    paddingTop: 10, paddingHorizontal: 8, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#EBEDF7',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 12,
  },
  navItem: { minWidth: 58, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navLabel: { fontSize: 10.5, color: '#A6ACC9', fontWeight: '600' },
  navLabelAktif: { color: colors.primary, fontWeight: '800' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 1 },
  fabWrap: { alignItems: 'center', marginTop: -30, minWidth: 64 },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', ...shadow.pop },
  fabLabel: { fontSize: 10.5, fontWeight: '800', color: colors.primary, marginTop: 3 },
});
