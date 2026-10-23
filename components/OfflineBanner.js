import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity, netinfoTerpasang } from '../services/connectivity';
import { colors, shadow, radius } from '../theme';
import { PESAN_API } from '../services/apiClient';

// ============================================================
// OFFLINE BANNER (TASK 03) — tampil di atas layar ketika internet
// terputus, hilang otomatis saat koneksi kembali aktif.
// ============================================================
export default function OfflineBanner() {
  const online = useConnectivity();
  const insets = useSafeAreaInsets();
  if (online || !netinfoTerpasang()) return null;

  return (
    <View style={[styles.banner, shadow.card, { marginTop: insets.top + 4 }]}>
      <Ionicons name="cloud-offline-outline" size={17} color="#fff" />
      <Text style={styles.text}>{PESAN_API.offline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', left: 16, right: 16, zIndex: 50,
    flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: colors.danger, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 11, elevation: 8,
  },
  text: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 12.5, lineHeight: 17 },
});
