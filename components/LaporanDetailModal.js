import React from 'react';
import {
  View, Text, Pressable, StyleSheet, Modal, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow, statusStyle } from '../theme';

export default function LaporanDetailModal({
  visible,
  laporan,
  onClose,
  onDelete,
  onEdit,
}) {
  if (!laporan) return null;

  const st = statusStyle[laporan.status] || { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' };

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={() => onClose()}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.container}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.close} accessibilityLabel="Tutup">
            <Ionicons name="close-outline" size={24} color={colors.muted} />
          </Pressable>
          <View style={styles.topRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#FFF1E6' }]}>
              <Ionicons name="alert-circle" size={26} color={colors.primary} />
            </View>
            <View style={[styles.badge, { backgroundColor: st.bg }]}>
              <View style={[styles.badgeDot, { backgroundColor: st.dot }]} />
              <Text style={[styles.badgeText, { color: st.text }]}>{laporan.status}</Text>
            </View>
          </View>
          <Text style={styles.title}>{laporan.judul}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={16} color={colors.muted} />
            <Text style={styles.loc}>{laporan.lokasi}</Text>
          </View>
          {laporan.deskripsi ? (
            <View style={styles.descBox}>
              <Text style={styles.descLabel}>Deskripsi</Text>
              <Text style={styles.desc}>{laporan.deskripsi}</Text>
            </View>
          ) : null}
          <View style={styles.foot}>
            <View style={styles.meta}>
              <Text style={styles.metaLabel}>Kategori</Text>
              <Text style={styles.metaValue}>{laporan.emoji}</Text>
            </View>
            <View style={styles.div} />
            <View style={styles.meta}>
              <Text style={styles.metaLabel}>Dibuat</Text>
              <Text style={styles.metaValue}>Baru saja</Text>
            </View>
          </View>
          <View style={styles.actions}>
            {onEdit ? (
              <Pressable style={[styles.btn, styles.btnOutline]} onPress={onEdit} accessibilityLabel="Edit">
                <Ionicons name="create-outline" size={18} color={colors.primary} />
                <Text style={styles.btnText}>Edit</Text>
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable style={styles.btn} onPress={onDelete} accessibilityLabel="Hapus">
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Hapus</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  container: { flex: 1, justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 34, maxHeight: 0.82, ...shadow.card,
  },
  close: { position: 'absolute', top: 12, right: 14, zIndex: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 10, lineHeight: 26 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  loc: { fontSize: 14, color: colors.muted, fontWeight: '500', flex: 1 },
  descBox: { marginBottom: 18 },
  descLabel: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  desc: { fontSize: 14, color: colors.text, lineHeight: 20 },
  foot: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F5F1EA' },
  meta: { flex: 1, alignItems: 'center' },
  div: { width: 1, backgroundColor: '#F0EBE3' },
  metaLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  metaValue: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 14, ...shadow.pop },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.primary },
  btnText: { fontWeight: '800', fontSize: 15 },
});
