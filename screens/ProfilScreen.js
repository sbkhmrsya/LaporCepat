import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, Switch, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getBiometricInfo } from '../services/authService';
import { confirmDialog, notify } from '../utils/dialog';
import { colors, shadow } from '../theme';

export default function ProfilScreen({ onBack, laporanCount = 0, onBuat = () => {} }) {
  const insets = useSafeAreaInsets();
  const { user, token, logout, bioEnabled, toggleBiometric } = useAuth();
  const [bioAvailable, setBioAvailable] = useState(false);
  const [notif, setNotif] = useState(true);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => { getBiometricInfo().then((i) => setBioAvailable(i.available)); }, []);

  const onToggle = async (on) => {
    try { await toggleBiometric(on); } catch (e) { notify('Biometrik', e.message || 'Gagal mengubah pengaturan.'); }
  };

  const onLogout = async () => {
    if (await confirmDialog('Keluar dari akun?', 'Kamu perlu masuk lagi untuk membuat laporan.', 'Keluar')) logout();
  };

  const inisial = (user?.nama || '?').trim().charAt(0).toUpperCase();
  const nama = user?.nama || 'Warga';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#3B2FBD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroTop}>
          <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Kembali">
            <Ionicons name="arrow-back" size={21} color="#fff" />
          </Pressable>
          <Text style={styles.heroTitle}>Profil Saya</Text>
          <Pressable style={styles.edit} onPress={() => notify('Edit Profil', 'Fitur edit profil segera hadir.')} accessibilityLabel="Edit profil">
            <Ionicons name="create-outline" size={19} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.idRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{inisial}</Text>
            <View style={styles.verified}><Ionicons name="checkmark" size={12} color="#fff" /></View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nama}>{nama}</Text>
            <Text style={styles.sub}>@{user?.username} • {user?.email}</Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}><Ionicons name="shield-checkmark" size={12} color="#4ADE80" /><Text style={styles.pillText}>Terverifikasi</Text></View>
              <View style={styles.pill}><Ionicons name="location" size={12} color="#C7BFFF" /><Text style={styles.pillText}>Warga Aktif</Text></View>
            </View>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.stat}><Text style={styles.statV}>{laporanCount}</Text><Text style={styles.statL}>Laporan</Text></View>
          <View style={styles.div} />
          <View style={styles.stat}><Text style={styles.statV}>4.9</Text><Text style={styles.statL}>Rating</Text></View>
          <View style={styles.div} />
          <View style={styles.stat}><Text style={styles.statV}>98%</Text><Text style={styles.statL}>Respons</Text></View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable style={[styles.cta, shadow.pop]} onPress={onBuat} accessibilityRole="button" accessibilityLabel="Buat laporan baru">
          <LinearGradient colors={['#8B5CF6', '#4338CA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
            <Ionicons name="add-circle" size={22} color="#fff" />
            <Text style={styles.ctaText}>Buat Laporan Baru</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>

        <Text style={styles.group}>Keamanan & Notifikasi</Text>
        <View style={[styles.menu, shadow.card]}>
          <MenuRow icon="finger-print" tint={colors.primaryLight} fg={colors.primary} title="Masuk dengan biometrik"
            desc={bioAvailable ? 'Sidik jari / wajah untuk login cepat' : 'Belum tersedia di perangkat ini'}
            right={<Switch value={bioEnabled} onValueChange={onToggle} disabled={!bioAvailable} trackColor={{ true: colors.primary, false: '#D6D3D1' }} />} />
          <View style={styles.sep} />
          <MenuRow icon="notifications" tint="#DBEAFE" fg="#1D4ED8" title="Notifikasi laporan"
            desc="Kabar status laporan via push"
            right={<Switch value={notif} onValueChange={setNotif} trackColor={{ true: colors.primary, false: '#D6D3D1' }} />} />
        </View>

        <Text style={styles.group}>Lainnya</Text>
        <View style={[styles.menu, shadow.card]}>
          <MenuRow icon="time" tint="#FEF3C7" fg="#B45309" title="Riwayat laporanku" desc={`${laporanCount} laporan tersimpan`} onPress={() => onBack()} />
          <View style={styles.sep} />
          <MenuRow icon="help-circle" tint="#FCE7F3" fg="#BE185D" title="Bantuan" desc="FAQ & hubungi petugas" onPress={() => notify('Bantuan', 'Hubungi 112 atau DM @laporcepat untuk bantuan.')} />
          <View style={styles.sep} />
          <MenuRow icon="information-circle" tint="#E0E7FF" fg="#4338CA" title="Tentang" desc="LaporCepat v1.0.0" onPress={() => notify('LaporCepat', 'Aplikasi pelaporan fasilitas umum yang cepat & transparan.')} />
        </View>

        <Text style={styles.group}>Sesi & Token</Text>
        <View style={[styles.menu, shadow.card]}>
          <Pressable style={styles.row} onPress={() => setShowToken(!showToken)} accessibilityRole="button" accessibilityLabel="Tampilkan token JWT">
            <View style={[styles.rowIcon, { backgroundColor: colors.infoBg }]}>
              <Ionicons name="key-outline" size={20} color={colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>JWT Access Token</Text>
              <Text style={styles.rowDesc}>{showToken ? 'Klik untuk menyembunyikan' : 'Token untuk autentikasi API'}</Text>
            </View>
            <Ionicons name={showToken ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.placeholder} />
          </Pressable>
          {showToken && token ? (
            <View style={styles.tokenBox}>
              <TextInput
                editable={false}
                value={token}
                style={styles.tokenInput}
                placeholderTextColor={colors.placeholder}
              />
              <Pressable style={styles.copyBtn} onPress={() => {
                notify('Token', 'Token disalin ke clipboard (simulasi).');
              }} accessibilityLabel="Salin token">
                <Ionicons name="copy-outline" size={18} color={colors.primary} />
              </Pressable>
            </View>
          ) : null}
        </View>

        <Pressable style={({ pressed }) => [styles.logout, pressed && { opacity: 0.75 }]} onPress={onLogout} accessibilityRole="button" accessibilityLabel="Keluar dari akun">
          <Ionicons name="log-out-outline" size={21} color={colors.danger} />
          <Text style={styles.logoutText}>Keluar Akun</Text>
        </Pressable>
        <Text style={styles.ver}>LaporCepat • v1.0.0 • Mock API aktif</Text>
      </ScrollView>
    </View>
  );
}

function MenuRow({ icon, tint, fg, title, desc, right, onPress }) {
  const C = (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={20} color={fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      {right || <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />}
    </View>
  );
  if (!onPress) return C;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>{C}</Pressable>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { paddingHorizontal: 18, paddingBottom: 64, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  back: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  edit: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { fontSize: 30, fontWeight: '900', color: colors.primary },
  verified: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  nama: { fontSize: 19, fontWeight: '900', color: '#fff' },
  sub: { fontSize: 12.5, color: '#DDD6FE', marginTop: 2 },
  pillRow: { flexDirection: 'row', gap: 7, marginTop: 9 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  statCard: { position: 'absolute', left: 18, right: 18, bottom: -30, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 15, borderWidth: 1, borderColor: '#EAECF7', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 14, elevation: 6 },
  stat: { flex: 1, alignItems: 'center' },
  statV: { fontSize: 18, fontWeight: '900', color: colors.text },
  statL: { fontSize: 11.5, color: colors.muted, fontWeight: '600', marginTop: 2 },
  div: { width: 1, backgroundColor: '#EBEDF7' },
  body: { padding: 18, paddingTop: 46, paddingBottom: 34 },
  cta: { borderRadius: 17, marginBottom: 20 },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 17, minHeight: 58, borderRadius: 17 },
  ctaText: { flex: 1, color: '#fff', fontWeight: '800', fontSize: 15.5 },
  group: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 6 },
  menu: { backgroundColor: '#fff', borderRadius: 19, padding: 6, borderWidth: 1, borderColor: '#EAECF7', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11 },
  rowIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14.5, fontWeight: '800', color: colors.text },
  rowDesc: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  sep: { height: 1, backgroundColor: '#EFF1F8', marginHorizontal: 12 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 54, marginTop: 18, borderRadius: 16, borderWidth: 1.5, borderColor: '#FECACA', backgroundColor: '#fff' },
  logoutText: { fontSize: 15.5, fontWeight: '800', color: colors.danger },
  ver: { textAlign: 'center', fontSize: 11.5, color: colors.placeholder, marginTop: 14 },
  tokenBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  tokenInput: { flex: 1, backgroundColor: '#F5F6FC', borderWidth: 1, borderColor: '#DFE2F0', borderRadius: 12, paddingHorizontal: 12, minHeight: 44, fontSize: 11, color: colors.text, fontFamily: 'monospace' },
  copyBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DFE2F0', alignItems: 'center', justifyContent: 'center' },
});
