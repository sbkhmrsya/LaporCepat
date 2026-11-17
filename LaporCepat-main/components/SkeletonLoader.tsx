import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { colors } from '../theme';

// Bar dengan efek shimmer (denyut lembut) seperti loading state aplikasi asli.
function ShimmerBar({ style }: { style: StyleProp<ViewStyle> }): React.JSX.Element {
  const anim = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return <Animated.View style={[styles.row, { opacity: anim }, style]} />;
}

export function SkeletonLoader({ rows = 3, width = '100%', height = 16, gap = 10 }: {
  rows?: number; width?: DimensionValue; height?: number; gap?: number;
}): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <ShimmerBar key={i} style={{ width: i === rows - 1 ? '70%' : width, height, marginBottom: i < rows - 1 ? gap : 0 }} />
      ))}
    </View>
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }): React.JSX.Element {
  return (
    <View style={[styles.card, style]}>
      <ShimmerBar style={{ width: '40%', height: 24 }} />
      <ShimmerBar style={{ width: '100%', height: 14, marginTop: 8 }} />
      <ShimmerBar style={{ width: '85%', height: 10, marginTop: 6 }} />
      <ShimmerBar style={{ width: '60%', height: 10, marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { backgroundColor: '#DFE2F0', borderRadius: 8 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#EAECF7', gap: 12 },
});
