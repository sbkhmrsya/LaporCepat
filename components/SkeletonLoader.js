import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export function SkeletonLoader({ rows = 3, width = '100%', height = 16, gap = 10 }) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.row, { width: i === rows - 1 ? '70%' : width, height, marginBottom: i < rows - 1 ? gap : 0 }]} />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={[styles.row, { width: '40%', height: 24 }]} />
      <View style={[styles.row, { width: '100%', height: 14, marginTop: 8 }]} />
      <View style={[styles.row, { width: '85%', height: 10, marginTop: 6 }]} />
      <View style={[styles.row, { width: '60%', height: 10, marginTop: 6 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { backgroundColor: '#EDE8E0', borderRadius: 8 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F3EEE7', gap: 12 },
});
