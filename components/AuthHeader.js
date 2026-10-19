import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../theme';

export default function AuthHeader({ title = 'LaporCepat', subtitle }) {
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <LinearGradient colors={['#F97316', '#C2410C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.logo, shadow.pop]}>
        <Ionicons name="megaphone" size={40} color="#fff" />
        <View style={styles.badge}><Ionicons name="flash" size={12} color={colors.primary} /></View>
      </LinearGradient>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.tick} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 26 },
  logo: { width: 92, height: 92, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  badge: { position: 'absolute', bottom: -6, right: -6, width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3EEE7' },
  title: { fontSize: 27, fontWeight: '900', letterSpacing: 2.5, color: colors.text },
  subtitle: { fontSize: 14.5, color: colors.muted, marginTop: 6, textAlign: 'center' },
  tick: { width: 42, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 12 },
});
