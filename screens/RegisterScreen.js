import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { validateRegister } from '../services/authService';
import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';
import { colors } from '../theme';

export default function RegisterScreen({ onGoLogin }) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [form, setForm] = useState({ nama: '', username: '', email: '', password: '', konfirmasi: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined, form: undefined }));
  };

  const submit = async () => {
    const errs = validateRegister(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    try {
      await register(form);
    } catch (e) {
      setErrors(e.field ? { [e.field]: e.message } : { form: e.message || 'Pendaftaran gagal. Coba lagi.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader subtitle="Buat akun untuk mulai melapor" />

        {errors.form ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{errors.form}</Text>
          </View>
        ) : null}

        <AuthInput label="Nama lengkap" icon="person-outline" placeholder="Nama kamu"
          value={form.nama} onChangeText={set('nama')} error={errors.nama}
          autoComplete="name" textContentType="name" />
        <AuthInput label="Username" icon="at-outline" placeholder="warga_baik"
          value={form.username} onChangeText={set('username')} error={errors.username}
          autoCapitalize="none" autoCorrect={false} autoComplete="username-new" textContentType="username" />
        <AuthInput label="Email" icon="mail-outline" placeholder="user@mail.com"
          value={form.email} onChangeText={set('email')} error={errors.email}
          autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
          autoComplete="email" textContentType="emailAddress" />
        <AuthInput label="Password" icon="lock-closed-outline" placeholder="Minimal 8 karakter" secure
          value={form.password} onChangeText={set('password')} error={errors.password}
          autoCapitalize="none" autoComplete="password-new" textContentType="newPassword" />
        <AuthInput label="Konfirmasi password" icon="lock-closed-outline" placeholder="Ulangi password" secure
          value={form.konfirmasi} onChangeText={set('konfirmasi')} error={errors.konfirmasi}
          autoCapitalize="none" onSubmitEditing={submit} />

        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, busy && styles.disabled]}
          onPress={submit}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Daftar"
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Daftar</Text>}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <Pressable onPress={onGoLogin} accessibilityRole="link" style={styles.linkHit}>
            <Text style={styles.link}>Masuk</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 22, flexGrow: 1 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerBg,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 14 },
  primary: {
    minHeight: 54, borderRadius: 12, backgroundColor: colors.primary, marginTop: 8,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },
  primaryPressed: { backgroundColor: colors.primaryDark },
  disabled: { opacity: 0.7 },
  primaryText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 16, color: colors.muted },
  linkHit: { minHeight: 44, justifyContent: 'center' },
  link: { fontSize: 16, fontWeight: '700', color: colors.primaryDark },
});
