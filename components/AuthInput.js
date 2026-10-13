import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function AuthInput({ label, icon, error, secure, ...rest }) {
  const [hidden, setHidden] = useState(!!secure);
  const [focus, setFocus] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focus && styles.fieldFocus, !!error && styles.fieldError]}>
        <Ionicons name={icon} size={22} color={colors.muted} style={styles.icon} />
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
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  fieldFocus: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 12 },
  eye: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  error: { color: colors.danger, fontSize: 13, marginTop: 6 },
});
