import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Modal, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapViewLeaflet, { PUSAT_MALANG } from './MapViewLeaflet';
import { colors, shadow, radius } from '../theme';

// ============================================================
// MAP PICKER (peta sungguhan OSM) — tap peta / geser pin untuk
// menentukan titik lokasi kerusakan, lalu simpan koordinatnya.
// ============================================================
export default function MapPickerModal({ visible, onClose, onConfirm = () => {} }) {
  const [titik, setTitik] = useState(PUSAT_MALANG);

  const pakai = () => {
    onConfirm({ lat: titik.lat, lng: titik.lng });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, shadow.card]}>
          {/* HEADER */}
          <View style={styles.head}>
            <View style={[styles.headIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headTitle}>Pilih Titik Lokasi</Text>
              <Text style={styles.headSub}>Tap peta / geser pin • Malang, Jawa Timur</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Tutup peta">
              <Ionicons name="close-circle" size={24} color={colors.placeholder} />
            </Pressable>
          </View>

          {/* PETA */}
          <View style={[styles.mapBox, shadow.card]}>
            <MapViewLeaflet
              center={titik}
              zoom={15}
              picker
              onPilih={setTitik}
            />
          </View>

          {/* KOORDINAT + AKSI */}
          <View style={styles.koordinatBox}>
            <Ionicons name="location" size={15} color={colors.primary} />
            <Text style={styles.koordinatText}>
              {titik.lat?.toFixed?.(5) ?? titik.lat}, {titik.lng?.toFixed?.(5) ?? titik.lng}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnOutline]} onPress={onClose} accessibilityLabel="Batal">
              <Text style={[styles.btnText, styles.btnOutlineText]}>Batal</Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={pakai} accessibilityRole="button" accessibilityLabel="Gunakan lokasi ini">
              <Ionicons name="checkmark" size={19} color="#fff" />
              <Text style={styles.btnText}>Gunakan Lokasi Ini</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(15,18,40,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 16, paddingBottom: 30, gap: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  headSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  mapBox: { height: 360, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  koordinatBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryLight, borderRadius: 12,
    paddingHorizontal: 12, minHeight: 40, borderWidth: 1, borderColor: colors.tintBorder,
  },
  koordinatText: { flex: 1, fontSize: 13, fontWeight: '800', color: colors.primaryDark, fontFamily: 'monospace' },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 14, backgroundColor: colors.primary, ...shadow.pop },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.primary, shadowOpacity: 0 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnOutlineText: { color: colors.primary },
});
