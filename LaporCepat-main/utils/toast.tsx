import React, { useEffect, useRef, useState } from 'react';
import { Animated, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../theme';
import type { IconName } from '../theme';

export type ToastKind = 'info' | 'success' | 'error' | 'warning';

interface ToastData {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

let pushFn: ((t: ToastData) => void) | null = null;

// Tampilkan toast bila ToastHost terpasang; fallback ke Alert/window jika belum.
export function showToast(kind: ToastKind, title: string, message?: string): void {
  if (pushFn) {
    pushFn({ id: Date.now() + Math.random(), kind, title, message });
    return;
  }
  const full = message ? `${title}\n\n${message}` : title;
  if (Platform.OS === 'web') window.alert(full);
  else Alert.alert(title, message ?? '');
}

const META: Record<ToastKind, { icon: IconName; bg: string }> = {
  info: { icon: 'information-circle', bg: colors.primary },
  success: { icon: 'checkmark-circle', bg: colors.success },
  error: { icon: 'alert-circle', bg: colors.danger },
  warning: { icon: 'warning', bg: colors.warning },
};

export function ToastHost(): React.JSX.Element | null {
  const [toast, setToast] = useState<ToastData | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    pushFn = (t: ToastData) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast(t);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true })
          .start(() => setToast(null));
      }, 2800);
    };
    return () => {
      pushFn = null;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [anim]);

  if (!toast) return null;
  const meta = META[toast.kind];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { marginTop: insets.top + 12 },
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
        },
      ]}
    >
      <View style={[styles.card, { backgroundColor: meta.bg }, shadow.pop]}>
        <Ionicons name={meta.icon} size={20} color="#fff" />
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
          {toast.message ? <Text style={styles.message} numberOfLines={3}>{toast.message}</Text> : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 16, right: 16, zIndex: 500 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
  },
  textCol: { flex: 1 },
  title: { color: '#fff', fontWeight: '800', fontSize: 14 },
  message: { color: 'rgba(255,255,255,0.85)', fontWeight: '600', fontSize: 12.5, lineHeight: 17, marginTop: 2 },
});
