import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getBiometricInfo, hasBiometricUser } from '../services/authService';
import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';
import { notify } from '../utils/dialog';
import { ENABLE_DEMO } from '../config';
import { colors, shadow } from '../theme';

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
      <LinearGradient colors={['#FFF1E6', colors.bg]} style={[styles.top, { paddingTop: insets.top + 18 }]}>
        <Pressable style={styles.gear} onPress={() => notify('LaporCepat', 'Versi 1.0.0 • Dibuat untuk warga.')} accessibilityRole="button" accessibilityLabel="Tentang aplikasi">
          <Ionicons name="information-circle-outline" size={24} color={colors.muted} />
        </Pressable>
      </LinearGradient>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 26 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AuthHeader subtitle="Selamat datang kembali 👋 Masuk untuk melapor" />

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={[styles.card, shadow.card]}>
          <AuthInput label="Email atau Username" icon="mail-outline" placeholder="nama@email.com"
            value={identifier} onChangeText={(t) => { setIdentifier(t); setError(''); }}
            autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
            autoComplete="username" textContentType="username" />
          <AuthInput label="Password" icon="lock-closed-outline" placeholder="••••••••" secure
            value={password} onChangeText={(t) => { setPassword(t); setError(''); }}
            autoCapitalize="none" autoComplete="password" textContentType="password"
            onSubmitEditing={() => run(() => login(identifier, password))} />
          <Pressable style={styles.forgot} onPress={() => notify('Lupa password', 'Akun tersimpan di perangkat ini. Daftar ulang dengan email lain jika perlu.')} accessibilityRole="button">
            <Text style={styles.forgotText}>Lupa password?</Text>
          </Pressable>

          <Pressable onPress={() => run(() => login(identifier, password))} disabled={busy} accessibilityRole="button" accessibilityLabel="Masuk">
            <LinearGradient colors={busy ? ['#FDBA74', '#FDBA74'] : ['#F97316', '#C2410C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primary}>
              {busy ? <ActivityIndicator color="#fff" /> : (<><Text style={styles.primaryText}>Masuk</Text><Ionicons name="arrow-forward" size={19} color="#fff" /></>)}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.divider}><View style={styles.line} /><Text style={styles.dividerText}>atau lanjut dengan</Text><View style={styles.line} /></View>

        <View style={styles.row}>
          <Pressable style={[styles.method, shadow.card]} onPress={() => tapBiometric(false)} disabled={busy} accessibilityRole="button" accessibilityLabel="Masuk dengan biometrik">
            <View style={styles.methodIcon}><Ionicons name="finger-print" size={24} color={colors.primary} /></View>
            <Text style={styles.methodText}>Sidik Jari</Text>
          </Pressable>
          <Pressable style={[styles.method, shadow.card]} onPress={() => tapBiometric(true)} disabled={busy} accessibilityRole="button" accessibilityLabel="Masuk dengan Face ID">
            <View style={styles.methodIcon}><Ionicons name="scan-outline" size={24} color={colors.primary} /></View>
            <Text style={styles.methodText}>Face ID</Text>
          </Pressable>
        </View>

        {ENABLE_DEMO ? (
          <Pressable style={styles.demo} onPress={() => run(loginDemo)} disabled={busy} accessibilityRole="button" accessibilityLabel="Gunakan akun demo">
            <Ionicons name="flash" size={19} color={colors.primaryDark} />
            <Text style={styles.demoText}>Masuk 1-Klik dengan Akun Demo</Text>
          </Pressable>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <Pressable onPress={onGoRegister} accessibilityRole="link" style={styles.linkHit}>
            <Text style={styles.link}>Daftar gratis</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: 22 },
  gear: { alignSelf: 'flex-end', width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EDE8E0', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 22, flexGrow: 1, paddingTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#F3EEE7' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerBg, borderRadius: 14, padding: 13, marginBottom: 14 },
  errorText: { flex: 1, color: colors.danger, fontSize: 13.5, fontWeight: '600' },
  forgot: { alignSelf: 'flex-end', minHeight: 40, justifyContent: 'center', marginTop: -4, marginBottom: 10 },
  forgotText: { color: colors.primary, fontSize: 13.5, fontWeight: '700' },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 56, borderRadius: 16, ...shadow.pop },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E9E2D8' },
  dividerText: { marginHorizontal: 12, color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  method: { flex: 1, minHeight: 92, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F3EEE7', alignItems: 'center', justifyContent: 'center', gap: 8 },
  methodIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  methodText: { fontSize: 13.5, fontWeight: '800', color: colors.text },
  demo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 52, marginTop: 14, borderRadius: 15, backgroundColor: '#FFFBEB', borderWidth: 1.5, borderColor: '#FDE68A', borderStyle: 'dashed' },
  demoText: { fontSize: 14.5, fontWeight: '800', color: colors.primaryDark },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14.5, color: colors.muted },
  linkHit: { minHeight: 44, justifyContent: 'center' },
  link: { fontSize: 14.5, fontWeight: '800', color: colors.primary },
});
