import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function AuthHeader({ title = 'LAPORCEPAT', subtitle }) {
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <View style={styles.logo}>
        <Ionicons name="megaphone" size={44} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.tint,
    borderWidth: 2,
    borderColor: colors.tintBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: 1.5, color: colors.text },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 6 },
});
