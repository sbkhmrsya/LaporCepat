import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { validateRegister } from '../services/authService';
import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';
import { colors, shadow } from '../theme';

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
    try { await register(form); }
    catch (e) { setErrors(e.field ? { [e.field]: e.message } : { form: e.message || 'Pendaftaran gagal. Coba lagi.' }); }
    finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 26 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader subtitle="Buat akun gratis dan mulai melapor hari ini" />

        {errors.form ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{errors.form}</Text>
          </View>
        ) : null}

        <View style={[styles.card, shadow.card]}>
          <AuthInput label="Nama lengkap" icon="person-outline" placeholder="Contoh: Budi Santoso"
            value={form.nama} onChangeText={set('nama')} error={errors.nama}
            autoComplete="name" textContentType="name" />
          <AuthInput label="Username" icon="at-outline" placeholder="warga_baik"
            value={form.username} onChangeText={set('username')} error={errors.username}
            autoCapitalize="none" autoCorrect={false} autoComplete="username-new" textContentType="username" />
          <AuthInput label="Email" icon="mail-outline" placeholder="nama@email.com"
            value={form.email} onChangeText={set('email')} error={errors.email}
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
            autoComplete="email" textContentType="emailAddress" />
          <AuthInput label="Password" icon="lock-closed-outline" placeholder="Minimal 8 karakter" secure
            value={form.password} onChangeText={set('password')} error={errors.password}
            autoCapitalize="none" autoComplete="password-new" textContentType="newPassword" />
          <AuthInput label="Konfirmasi password" icon="shield-checkmark-outline" placeholder="Ulangi password" secure
            value={form.konfirmasi} onChangeText={set('konfirmasi')} error={errors.konfirmasi}
            autoCapitalize="none" onSubmitEditing={submit} />

          <Pressable onPress={submit} disabled={busy} accessibilityRole="button" accessibilityLabel="Daftar" style={{ marginTop: 6 }}>
            <LinearGradient colors={busy ? ['#FDBA74', '#FDBA74'] : ['#F97316', '#C2410C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primary}>
              {busy ? <ActivityIndicator color="#fff" /> : (<><Text style={styles.primaryText}>Buat Akun</Text><Ionicons name="checkmark-circle" size={19} color="#fff" /></>)}
            </LinearGradient>
          </Pressable>
          <Text style={styles.terms}>Dengan mendaftar, kamu menyetujui Syarat & Ketentuan LaporCepat.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <Pressable onPress={onGoLogin} accessibilityRole="link" style={styles.linkHit}>
            <Text style={styles.link}>Masuk di sini</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 22, flexGrow: 1 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#F3EEE7' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerBg, borderRadius: 14, padding: 13, marginBottom: 14 },
  errorText: { flex: 1, color: colors.danger, fontSize: 13.5, fontWeight: '600' },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 56, borderRadius: 16, ...shadow.pop },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  terms: { textAlign: 'center', fontSize: 11.5, color: colors.placeholder, marginTop: 12, lineHeight: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 22 },
  footerText: { fontSize: 14.5, color: colors.muted },
  linkHit: { minHeight: 44, justifyContent: 'center' },
  link: { fontSize: 14.5, fontWeight: '800', color: colors.primary },
});
