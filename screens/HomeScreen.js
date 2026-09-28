import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Header from '../components/Header';
import ReportList from '../components/ReportList';

// ============================================================
// HOME SCREEN — halaman utama app LaporCepat
// Menggabungkan Header, Hero/Visual, Button Action, ReportList,
// dan Bottom Navigation.
// Task 01: UI dasar | Task 02: Responsive | Task 03: Accessibility
// ============================================================
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isLayarLebar = width >= 600;

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HERO / VISUAL + JUDUL + INFORMASI UTAMA + BUTTON ACTION */}
        <View
          style={[styles.heroCard, { flexDirection: isLayarLebar ? 'row' : 'column' }]}
        >
          <View style={[styles.heroImageWrap, { width: isLayarLebar ? '40%' : '100%' }]}>
            <Text style={styles.heroEmoji}>🚧📍🔧</Text>
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Lapor Kerusakan, Pantau Perbaikan</Text>
            <Text style={styles.heroSubtitle}>
              Laporkan fasilitas umum yang rusak di lingkunganmu — cepat,
              transparan, dan mudah dipantau.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              accessible={true}
              accessibilityLabel="Buat laporan baru"
              accessibilityRole="button"
              accessibilityHint="Membuka form untuk melaporkan kerusakan fasilitas umum"
            >
              <Text style={styles.primaryButtonText}>+ Buat Laporan</Text>
            </Pressable>
          </View>
        </View>

        <ReportList isLayarLebar={isLayarLebar} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem label="Beranda" icon="🏠" active />
        <NavItem label="Peta" icon="🗺️" />
        <NavItem label="Lapor" icon="➕" />
        <NavItem label="Profil" icon="👤" />
      </View>
    </View>
  );
}

function NavItem({ label, icon, active }) {
  return (
    <Pressable
      style={styles.navItem}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityHint={`Pindah ke halaman ${label}`}
    >
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F1' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 2,
  },
  heroImageWrap: {
    height: 160,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 44,
  },
  heroTextWrap: { flex: 1, padding: 18, justifyContent: 'center' },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#1C1917', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: '#78716C', lineHeight: 20, marginBottom: 16 },
  primaryButton: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  primaryButtonPressed: { backgroundColor: '#C2410C' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FDE0C7',
  },
  navItem: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 11, color: '#A8A29E', marginTop: 2 },
  navLabelActive: { color: '#EA580C', fontWeight: '700' },
});
