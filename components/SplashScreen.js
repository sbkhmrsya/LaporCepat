import React, { useEffect, useState } from 'react';
import {
  View, Text, ActivityIndicator, StatusBar, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onComplete(); }, 1400);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.primaryGradient} style={styles.grad}>
        <View style={styles.logoWrap}>
          <Ionicons name="megaphone" size={64} color="#fff" />
          <View style={styles.badge}><Ionicons name="flash" size={16} color={colors.primary} /></View>
        </View>
        <Text style={styles.title}>LaporCepat</Text>
        <Text style={styles.sub}>Pelaporan Kerusakan Umum</Text>
      </LinearGradient>
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat sesi…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  grad: { ...StyleSheet.absoluteFillObject },
  logoWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  badge: { position: 'absolute', bottom: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
  title: { alignSelf: 'center', fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: 3, marginTop: 10 },
  sub: { alignSelf: 'center', fontSize: 14, color: '#DDD6FE', marginTop: 4, letterSpacing: 1 },
  loading: { alignItems: 'center', marginTop: 24, gap: 8 },
  loadingText: { fontSize: 13, color: '#DDD6FE', fontWeight: '600' },
});
