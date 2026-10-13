import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getBiometricInfo, hasBiometricUser } from '../services/authService';
import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';
import { notify } from '../utils/dialog';
import { ENABLE_DEMO } from '../config';
import { colors } from '../theme';

export default function LoginScreen({ onGoRegister }) {
  const insets = useSafeAreaInsets();
  const { login, loginDemo, loginBiometric } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [bio, setBio] = useState({ available: false, hasFace: false, hasFingerprint: false });

  useEffect(() => { getBiometricInfo().then(setBio); }, []);

  const run = async (fn) => {
    setError('');
    setBusy(true);
    try { await fn(); } catch (e) { setError(e.message || 'Terjadi kesalahan. Coba lagi.'); }
    finally { setBusy(false); }
  };

  const tapBiometric = async (needFace) => {
    if (!bio.available || (needFace && !bio.hasFace)) {
      notify(needFace ? 'Face ID tidak tersedia' : 'Biometrik tidak tersedia',
        'Perangkat ini belum mendukung atau belum mengatur fitur tersebut.');
      return;
    }
    if (!(await hasBiometricUser())) {
      notify('Biometrik belum aktif', 'Masuk dengan password dulu, lalu aktifkan di halaman Profil.');
      return;
    }
    run(loginBiometric);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={[styles.gear, { top: insets.top + 12 }]}
          onPress={() => notify('Pengaturan', 'LaporCepat versi 1.0.0')}
          accessibilityRole="button"
          accessibilityLabel="Pengaturan"
        >
          <Ionicons name="settings-sharp" size={26} color={colors.muted} />
        </Pressable>

        <AuthHeader subtitle="Masuk untuk melanjutkan" />

        {error ? (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <AuthInput
          label="Email atau Username"
          icon="mail-outline"
          placeholder="user@mail.com"
          value={identifier}
          onChangeText={(t) => { setIdentifier(t); setError(''); }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="username"
          textContentType="username"
        />
        <AuthInput
          label="Password"
          icon="lock-closed-outline"
          placeholder="Masukkan password"
          secure
          value={password}
          onChangeText={(t) => { setPassword(t); setError(''); }}
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          onSubmitEditing={() => run(() => login(identifier, password))}
        />

        <Pressable
          style={styles.forgot}
          onPress={() => notify('Lupa password', 'Akun tersimpan di perangkat ini, jadi password belum bisa direset. Daftar ulang dengan email lain jika perlu.')}
          accessibilityRole="button"
        >
          <Text style={styles.forgotText}>Lupa password?</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, busy && styles.disabled]}
          onPress={() => run(() => login(identifier, password))}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Masuk"
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Masuk</Text>}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.row}>
          <Pressable
            style={[styles.method, !bio.hasFingerprint && bio.available && styles.methodDim]}
            onPress={() => tapBiometric(false)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Masuk dengan biometrik"
          >
            <Ionicons name="finger-print" size={30} color={colors.primary} />
            <Text style={styles.methodText}>Biometrik</Text>
          </Pressable>
          <Pressable
            style={[styles.method, !bio.hasFace && styles.methodDim]}
            onPress={() => tapBiometric(true)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Masuk dengan Face ID"
          >
            <Ionicons name="scan-outline" size={30} color={colors.primary} />
            <Text style={styles.methodText}>Face ID</Text>
          </Pressable>
        </View>

        {ENABLE_DEMO ? (
          <Pressable
            style={styles.demo}
            onPress={() => run(loginDemo)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Gunakan akun demo"
          >
            <Ionicons name="flash-outline" size={22} color={colors.text} />
            <Text style={styles.demoText}>Gunakan Akun Demo (1-Klik)</Text>
          </Pressable>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <Pressable onPress={onGoRegister} accessibilityRole="link" style={styles.linkHit}>
            <Text style={styles.link}>Daftar sekarang</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 22, flexGrow: 1 },
  gear: {
    position: 'absolute', right: 0, width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#E7E5E4', alignItems: 'center', justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerBg,
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 14 },
  forgot: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', marginTop: -8, marginBottom: 4 },
  forgotText: { color: colors.muted, fontSize: 15 },
  primary: {
    minHeight: 54, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
  },
  primaryPressed: { backgroundColor: colors.primaryDark },
  disabled: { opacity: 0.7 },
  primaryText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 14, color: colors.muted, fontSize: 15 },
  row: { flexDirection: 'row', gap: 16 },
  method: {
    flex: 1, minHeight: 80, borderRadius: 14, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  methodDim: { opacity: 0.55 },
  methodText: { fontSize: 15, fontWeight: '600', color: colors.text },
  demo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 52, marginTop: 16, borderRadius: 12, backgroundColor: colors.tint,
    borderWidth: 1, borderColor: colors.tintBorder,
  },
  demoText: { fontSize: 16, fontWeight: '600', color: colors.text },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 16, color: colors.muted },
  linkHit: { minHeight: 44, justifyContent: 'center' },
  link: { fontSize: 16, fontWeight: '700', color: colors.primaryDark },
});
