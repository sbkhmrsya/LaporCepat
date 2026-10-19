import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../theme';

export default function AuthInput({ label, icon, error, secure, ...rest }) {
  const [hidden, setHidden] = useState(!!secure);
  const [focus, setFocus] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focus && styles.focus, error && styles.err, focus && shadow.card]}>
        <View style={[styles.iconBox, focus && styles.iconBoxOn]}>
          <Ionicons name={icon} size={19} color={focus ? '#fff' : colors.muted} />
        </View>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={hidden}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          accessibilityLabel={label}
          {...rest}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            style={styles.eye}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Tampilkan password' : 'Sembunyikan password'}
            hitSlop={8}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={21} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errRow}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 15 },
  label: { fontSize: 13.5, fontWeight: '800', color: colors.text, marginBottom: 8, letterSpacing: 0.2 },
  field: {
    flexDirection: 'row', alignItems: 'center', minHeight: 58,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: '#EDE8E0',
    borderRadius: 16, paddingLeft: 6, paddingRight: 6,
  },
  focus: { borderColor: colors.primary, backgroundColor: '#fff' },
  err: { borderColor: colors.danger },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F6F7FB', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  iconBoxOn: { backgroundColor: colors.primary },
  input: { flex: 1, fontSize: 15.5, color: colors.text, paddingVertical: 12 },
  eye: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  errText: { color: colors.danger, fontSize: 12.5, fontWeight: '600', flex: 1 },
});
