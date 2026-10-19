import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../theme';

// ============================================================
// BUAT LAPORAN MODERN — pilih kategori kartu, form berikon,
// area deskripsi, tombol gradasi. POST ke REST API.
// ============================================================
const KATEGORI = [
  { emoji: '💡', label: 'Lampu', icon: 'bulb', desc: 'Penerangan jalan' },
  { emoji: '🕳️', label: 'Jalan', icon: 'construct', desc: 'Lubang / rusak' },
  { emoji: '🌊', label: 'Air', icon: 'water', desc: 'Saluran / banjir' },
  { emoji: '🗑️', label: 'Sampah', icon: 'trash', desc: 'Tumpukan liar' },
];

export default function BuatLaporanScreen({ onBack, onSubmit }) {
  const [judul, setJudul] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [emoji, setEmoji] = useState(KATEGORI[0].emoji);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const insets = useSafeAreaInsets();
  const aktif = KATEGORI.find((k) => k.emoji === emoji);

  const kirim = async () => {
    if (!judul.trim() || !lokasi.trim()) {
      setError('Judul dan lokasi wajib diisi.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await onSubmit({ judul: judul.trim(), lokasi: lokasi.trim(), deskripsi: deskripsi.trim(), status: 'Dilaporkan', emoji });
    } catch (e) {
      setError(e.message || 'Gagal mengirim laporan. Coba lagi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#F97316', '#C2410C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Kembali">
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Buat Laporan</Text>
          <Text style={styles.headerSub}>Lengkapi detail kerusakan di bawah</Text>
        </View>
        <View style={styles.step}><Text style={styles.stepText}>1/1</Text></View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Pilih Kategori</Text>
        <View style={styles.grid}>
          {KATEGORI.map((k) => {
            const on = k.emoji === emoji;
            return (
              <Pressable
                key={k.label}
                onPress={() => setEmoji(k.emoji)}
                style={[styles.cat, on && styles.catOn, on && shadow.pop]}
                accessibilityRole="button" accessibilityLabel={`Kategori ${k.label}`}
                accessibilityState={{ selected: on }}
              >
                <View style={[styles.catIcon, on && styles.catIconOn]}>
                  <Ionicons name={k.icon} size={22} color={on ? '#fff' : colors.primary} />
                </View>
                <Text style={[styles.catLabel, on && styles.catLabelOn]}>{k.emoji} {k.label}</Text>
                <Text style={[styles.catDesc, on && styles.catDescOn]}>{k.desc}</Text>
                {on && <View style={styles.check}><Ionicons name="checkmark" size={13} color="#fff" /></View>}
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, shadow.card]}>
          <Field label="Judul kerusakan" icon="create-outline">
            <TextInput
              style={styles.input} value={judul}
              onChangeText={(t) => { setJudul(t); setError(''); }}
              placeholder="Contoh: Lampu taman mati total"
              placeholderTextColor={colors.placeholder}
              accessibilityLabel="Judul kerusakan"
            />
          </Field>
          <Field label="Lokasi" icon="location-outline">
            <TextInput
              style={styles.input} value={lokasi}
              onChangeText={(t) => { setLokasi(t); setError(''); }}
              placeholder="Contoh: Jl. Melati No. 5, RT 04"
              placeholderTextColor={colors.placeholder}
              accessibilityLabel="Lokasi kerusakan"
            />
          </Field>
          <Field label="Deskripsi (opsional)" icon="document-text-outline" last>
            <TextInput
              style={[styles.input, styles.area]} value={deskripsi}
              onChangeText={setDeskripsi}
              placeholder="Ceritakan kondisi, sejak kapan, dampaknya…"
              placeholderTextColor={colors.placeholder}
              multiline numberOfLines={4} textAlignVertical="top"
              accessibilityLabel="Deskripsi laporan"
            />
          </Field>

          <Pressable style={styles.photo} onPress={() => {}} accessibilityRole="button" accessibilityLabel="Tambah foto">
            <Ionicons name="camera-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.photoTitle}>Tambah Foto</Text>
              <Text style={styles.photoSub}>Bukti visual mempercepat verifikasi</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </Pressable>
        </View>

        {error ? (
          <View style={styles.err}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errText}>{error}</Text>
          </View>
        ) : null}

        <Pressable onPress={kirim} disabled={sending} accessibilityRole="button" accessibilityLabel="Kirim laporan">
          <LinearGradient
            colors={sending ? ['#FDBA74', '#FDBA74'] : ['#F97316', '#C2410C']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.submit}
          >
            {sending
              ? <ActivityIndicator color="#fff" />
              : (<><Ionicons name="send" size={18} color="#fff" /><Text style={styles.submitText}>Kirim Laporan • {aktif.label}</Text></>)}
          </LinearGradient>
        </Pressable>
        <Text style={styles.hint}>Laporan dikirim ke API dan tampil paling atas di Beranda.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, icon, children, last }) {
  return (
    <View style={[styles.field, !last && styles.fieldGap]}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={15} color={colors.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 20, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12.5, color: '#FFEDD5', marginTop: 2 },
  step: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 },
  stepText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  content: { padding: 18, paddingBottom: 36 },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  cat: { width: '47.5%', backgroundColor: '#fff', borderRadius: 18, padding: 14, borderWidth: 1.5, borderColor: '#F0EAE0', position: 'relative' },
  catOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  catIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  catIconOn: { backgroundColor: 'rgba(255,255,255,0.22)' },
  catLabel: { fontSize: 14.5, fontWeight: '800', color: colors.text },
  catLabelOn: { color: '#fff' },
  catDesc: { fontSize: 12, color: colors.muted, marginTop: 2 },
  catDescOn: { color: '#FFEDD5' },
  check: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F3EEE7', marginBottom: 14 },
  fieldGap: { marginBottom: 14 },
  field: {},
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  label: { fontSize: 13.5, fontWeight: '800', color: colors.text },
  input: { backgroundColor: '#F8F7F4', borderWidth: 1, borderColor: '#EDE8E0', borderRadius: 13, paddingHorizontal: 13, minHeight: 50, fontSize: 15, color: colors.text },
  area: { minHeight: 96, paddingVertical: 12, lineHeight: 20 },
  photo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, backgroundColor: colors.primaryLight, borderWidth: 1.5, borderColor: colors.tintBorder, borderStyle: 'dashed', borderRadius: 14, padding: 13 },
  photoTitle: { fontSize: 14, fontWeight: '800', color: colors.primaryDark },
  photoSub: { fontSize: 12, color: colors.muted, marginTop: 1 },
  err: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerBg, borderRadius: 13, padding: 12, marginBottom: 12 },
  errText: { flex: 1, color: colors.danger, fontSize: 13.5, fontWeight: '600' },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 56, borderRadius: 16, ...shadow.pop },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hint: { textAlign: 'center', fontSize: 12, color: colors.placeholder, marginTop: 12 },
});
