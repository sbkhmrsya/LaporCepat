import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getBiometricInfo } from '../services/authService';
import { confirmDialog, notify } from '../utils/dialog';
import { colors } from '../theme';

export default function ProfilScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const { user, logout, bioEnabled, toggleBiometric } = useAuth();
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => { getBiometricInfo().then((i) => setBioAvailable(i.available)); }, []);

  const onToggle = async (on) => {
    try { await toggleBiometric(on); } catch (e) { notify('Biometrik', e.message || 'Gagal mengubah pengaturan.'); }
  };

  const onLogout = async () => {
    if (await confirmDialog('Keluar dari akun?', 'Kamu perlu masuk lagi untuk membuat laporan.', 'Keluar')) logout();
  };

  const inisial = (user?.nama || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Kembali">
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.body}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{inisial}</Text></View>
        <Text style={styles.nama}>{user?.nama}</Text>
        <Text style={styles.sub}>@{user?.username}</Text>
        <Text style={styles.sub}>{user?.email}</Text>

        <View style={styles.card}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Masuk dengan biometrik</Text>
            <Text style={styles.cardDesc}>
              {bioAvailable ? 'Buka aplikasi memakai sidik jari atau wajah.' : 'Belum tersedia di perangkat ini.'}
            </Text>
          </View>
          <Switch
            value={bioEnabled}
            onValueChange={onToggle}
            disabled={!bioAvailable}
            trackColor={{ true: colors.primary, false: '#D6D3D1' }}
            accessibilityLabel="Masuk dengan biometrik"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.8 }]}
          onPress={onLogout}
          accessibilityRole="button"
          accessibilityLabel="Keluar dari akun"
        >
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>Keluar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingBottom: 16, backgroundColor: colors.primary,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#fff' },
  body: { padding: 20, alignItems: 'center' },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.tint, borderWidth: 2,
    borderColor: colors.tintBorder, alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 14,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: colors.primary },
  nama: { fontSize: 22, fontWeight: '700', color: colors.text },
  sub: { fontSize: 14, color: colors.muted, marginTop: 2 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch', marginTop: 28,
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.muted, marginTop: 2 },
  logout: {
    alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 52, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.card,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: colors.danger },
});
