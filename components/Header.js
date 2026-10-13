import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================================
// HEADER — bagian atas app Sigap
// Task 01: Header
// Task 03: Accessibility (accessibilityLabel, Role, Hint, touch target 44x44)
// ============================================================
export default function Header() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]} accessible={true} accessibilityRole="header">
      <Text style={styles.headerTitle}>LaporCepat</Text>
      <Pressable
        style={styles.iconButton}
        accessible={true}
        accessibilityLabel="Cari laporan"
        accessibilityRole="button"
        accessibilityHint="Membuka pencarian laporan"
      >
        <Text style={styles.iconText}>🔍</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#EA580C',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
});
