import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, shadow } from '../theme';

// ============================================================
// HEADER MODERN — logo, sapaan user, tombol notifikasi + avatar.
// Seperti aplikasi produksi: bersih, ada shadow, tanpa blok oranye.
// ============================================================
export default function Header({ onBell = () => {}, onAvatar = () => {} }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const nama = user?.nama?.split(' ')[0] || 'Warga';
  const inisial = (user?.nama || 'W').trim().charAt(0).toUpperCase();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]} accessible accessibilityRole="header">
      <View style={styles.left}>
        <View style={styles.logoMark}>
          <Ionicons name="megaphone" size={22} color="#fff" />
        </View>
        <View>
          <Text style={styles.greet}>Halo, {nama} 👋</Text>
          <View style={styles.locRow}>
            <Ionicons name="location" size={13} color={colors.primary} />
            <Text style={styles.loc}>Kotamu, Indonesia</Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Pressable
          style={({ pressed }) => [styles.bell, pressed && { opacity: 0.7 }]}
          onPress={onBell}
          accessibilityRole="button"
          accessibilityLabel="Notifikasi"
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.dot} />
        </Pressable>
        <Pressable
          style={styles.avatar}
          onPress={onAvatar}
          accessibilityRole="button"
          accessibilityLabel="Buka profil"
        >
          <Text style={styles.avatarText}>{inisial}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEDF7',
    ...shadow.card,
    zIndex: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  logoMark: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  greet: { fontSize: 16, fontWeight: '800', color: colors.text },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  loc: { fontSize: 12.5, color: colors.muted, fontWeight: '500' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bell: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F6FB',
    borderWidth: 1, borderColor: '#E4E7F3',
    alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    position: 'absolute', top: 11, right: 12, width: 9, height: 9,
    borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#fff',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight,
    borderWidth: 1.5, borderColor: colors.tintBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.primary },
});
