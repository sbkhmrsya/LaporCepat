import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// ============================================================
// BUAT LAPORAN — form untuk menambah laporan kerusakan baru
// Fitur: input judul, lokasi, kategori (emoji), validasi, lalu
// laporan baru muncul di daftar Beranda dengan status "Dilaporkan".
// ============================================================
const KATEGORI = [
  { emoji: '💡', label: 'Lampu' },
  { emoji: '🕳️', label: 'Jalan' },
  { emoji: '🌊', label: 'Saluran Air' },
  { emoji: '🗑️', label: 'Sampah' },
];

export default function BuatLaporanScreen({ onBack, onSubmit }) {
  const [judul, setJudul] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [emoji, setEmoji] = useState(KATEGORI[0].emoji);
  const [error, setError] = useState('');

  const kirim = () => {
    if (!judul.trim() || !lokasi.trim()) {
      setError('Judul dan lokasi wajib diisi.');
      return;
    }
    onSubmit({
      id: String(Date.now()),
      judul: judul.trim(),
      lokasi: lokasi.trim(),
      status: 'Dilaporkan',
      emoji,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.iconButton}
          accessibilityLabel="Kembali"
          accessibilityRole="button"
          accessibilityHint="Kembali ke beranda"
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Buat Laporan</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.chipRow}>
          {KATEGORI.map((k) => {
            const aktif = k.emoji === emoji;
            return (
              <Pressable
                key={k.label}
                onPress={() => setEmoji(k.emoji)}
                style={[styles.chip, aktif && styles.chipAktif]}
                accessibilityRole="button"
                accessibilityLabel={`Kategori ${k.label}`}
                accessibilityState={{ selected: aktif }}
              >
                <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>
                  {k.emoji} {k.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Judul kerusakan</Text>
        <TextInput
          style={styles.input}
          value={judul}
          onChangeText={(t) => { setJudul(t); setError(''); }}
          placeholder="contoh: Lampu taman mati"
          accessibilityLabel="Judul kerusakan"
        />

        <Text style={styles.label}>Lokasi</Text>
        <TextInput
          style={styles.input}
          value={lokasi}
          onChangeText={(t) => { setLokasi(t); setError(''); }}
          placeholder="contoh: Jl. Melati No. 5"
          accessibilityLabel="Lokasi kerusakan"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}
          onPress={kirim}
          accessibilityRole="button"
          accessibilityLabel="Kirim laporan"
          accessibilityHint="Menambahkan laporan ke daftar"
        >
          <Text style={styles.submitText}>Kirim Laporan</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F1' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#EA580C',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#1C1917', marginBottom: 8, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FDE0C7',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  chipAktif: { backgroundColor: '#EA580C', borderColor: '#EA580C' },
  chipText: { fontSize: 14, color: '#57534E' },
  chipTextAktif: { color: '#FFFFFF', fontWeight: '600' },
  input: {
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE0C7',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  error: { color: '#B91C1C', fontSize: 13, marginTop: 10 },
  submit: {
    marginTop: 20,
    backgroundColor: '#EA580C',
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPressed: { backgroundColor: '#C2410C' },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
