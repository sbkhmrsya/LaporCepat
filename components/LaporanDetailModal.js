import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Modal, TouchableWithoutFeedback,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow, statusStyle, categoryMeta } from '../theme';
import { STATUS_VALID } from '../data/models';

export default function LaporanDetailModal({
  visible,
  laporan,
  onClose,
  onDelete,
  onEdit,
  onUpdateStatus = null,
}) {
  const [menyimpan, setMenyimpan] = useState(false);

  // Sinkron status lokal saat laporan berubah / modal dibuka.
  useEffect(() => setMenyimpan(false), [laporan?.id, laporan?.status, visible]);
  if (!laporan) return null;

  const st = statusStyle[laporan.status] || { bg: '#E4E8FE', text: '#4338CA', dot: '#6D5EF8' };
  const cat = categoryMeta[laporan.emoji] || { icon: 'alert-circle', bg: colors.primaryLight, fg: colors.primary };
  const urutanSekarang = STATUS_VALID.indexOf(laporan.status);

  const ubahStatus = async (statusBaru) => {
    if (!onUpdateStatus || statusBaru === laporan.status || menyimpan) return;
    setMenyimpan(true);
    try {
      await onUpdateStatus(laporan.id, statusBaru);
    } finally {
      setMenyimpan(false);
    }
  };

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
            <View style={[styles.iconWrap, { backgroundColor: cat.bg }]}>
              {cat.icon ? <Ionicons name={cat.icon} size={26} color={cat.fg} /> : <Text style={styles.emoji}>{laporan.emoji}</Text>}
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

          {/* TIMELINE PROGRES (Ditolak bukan tahapan progres) */}
          <View style={styles.timeline}>
            {STATUS_VALID.filter((s) => s !== 'Ditolak').map((s, i, arr) => {
              const lolos = urutanSekarang >= i && laporan.status !== 'Ditolak';
              return (
                <View key={s} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, lolos && { backgroundColor: colors.primary }]} />
                  {i < arr.length - 1 && (
                    <View style={[styles.timelineLine, lolos && { backgroundColor: colors.primary }]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* UBAH STATUS */}
          <View style={styles.statusBox}>
            <View style={styles.statusHead}>
              <Ionicons name="swap-vertical" size={15} color={colors.primary} />
              <Text style={styles.statusHeadText}>Ubah Status Laporan</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusChips}>
              {STATUS_VALID.map((s) => {
                const meta = statusStyle[s];
                const on = laporan.status === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => ubahStatus(s)}
                    disabled={!onUpdateStatus || on || menyimpan}
                    style={[
                      styles.statusChip,
                      { backgroundColor: on ? meta.dot : meta.bg },
                      (!onUpdateStatus || menyimpan) && { opacity: 0.55 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Ubah status menjadi ${s}`}
                    accessibilityState={{ selected: on, disabled: !onUpdateStatus || menyimpan }}
                  >
                    <View style={[styles.statusDot, { backgroundColor: on ? '#fff' : meta.dot }]} />
                    <Text style={[styles.statusText, on && styles.statusTextOn]}>{s}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {menyimpan && (
              <View style={styles.savingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.savingText}>Menyimpan status…</Text>
              </View>
            )}
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
                <Text style={[styles.btnText, styles.btnOutlineText]}>Edit</Text>
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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,18,40,0.55)', justifyContent: 'flex-end' },
  container: { flex: 1, justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 34, maxHeight: 0.85, ...shadow.card,
  },
  close: { position: 'absolute', top: 12, right: 14, zIndex: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 10, lineHeight: 26 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  loc: { fontSize: 14, color: colors.muted, fontWeight: '500', flex: 1 },
  timeline: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 6 },
  timelineItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  timelineLine: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 3 },
  statusBox: { backgroundColor: colors.bg, borderRadius: 16, padding: 12, gap: 10, borderWidth: 1, borderColor: colors.line },
  statusHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusHeadText: { fontSize: 12, fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.8 },
  statusChips: { gap: 8, paddingRight: 4 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 38, borderRadius: 999 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12.5, fontWeight: '800', color: colors.text },
  statusTextOn: { color: '#fff' },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  savingText: { fontSize: 12.5, color: colors.muted, fontWeight: '600' },
  descBox: { marginTop: 14 },
  descLabel: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  desc: { fontSize: 14, color: colors.text, lineHeight: 20 },
  foot: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line },
  meta: { flex: 1, alignItems: 'center' },
  div: { width: 1, backgroundColor: colors.border },
  metaLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  metaValue: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 14, backgroundColor: colors.primary, ...shadow.pop },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.primary },
  btnText: { fontWeight: '800', fontSize: 15, color: '#fff' },
  btnOutlineText: { color: colors.primary },
});
