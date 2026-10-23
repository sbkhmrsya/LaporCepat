import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow, statusStyle, categoryMeta } from '../theme';
import LaporanDetailModal from './LaporanDetailModal';

// Alur status maju satu langkah: Dilaporkan -> Diverifikasi -> Dikerjakan -> Selesai.
const NEXT_STATUS = {
  Dilaporkan: 'Diverifikasi',
  Diverifikasi: 'Dikerjakan',
  Dikerjakan: 'Selesai',
};

// Label & gaya tombol aksi cepat sesuai status tujuan.
const AKSI_STATUS = {
  Diverifikasi: { label: 'Verifikasi', icon: 'checkmark-circle-outline', bg: colors.infoBg, fg: colors.info },
  Dikerjakan: { label: 'Kerjakan', icon: 'construct-outline', bg: colors.warningBg, fg: colors.warning },
  Selesai: { label: 'Selesaikan', icon: 'flag-outline', bg: colors.successBg, fg: colors.success },
};

// ============================================================
// REPORT LIST MODERN — kartu putih dengan shadow lembut,
// ikon kategori, lokasi, badge status dengan dot, tombol hapus.
// Tekan kartu untuk lihat detail.
// ============================================================
export default function ReportList({
  isLayarLebar,
  laporan = [],
  onDelete = null,
  onDetail = null,
  onUpdateStatus = null,
}) {
  const [detail, setDetail] = useState(null);

  // Ambil versi TERBARU dari laporan yang dibuka di modal,
  // agar perubahan status langsung terlihat tanpa tutup-buka modal.
  const detailFresh = detail
    ? (laporan.find((x) => String(x.id) === String(detail.id)) || detail)
    : null;

  if (!laporan.length) {
    return (
      <View>
        <SectionHead count={0} />
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons name="file-tray-outline" size={34} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Belum ada laporan</Text>
          <Text style={styles.emptyText}>Jadilah yang pertama melapor di lingkunganmu 🚀</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <SectionHead count={laporan.length} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.cardList,
          { flexDirection: isLayarLebar ? 'row' : 'column', flexWrap: 'wrap', paddingBottom: 100 },
        ]}
      >
        {laporan.map((item) => {
          const st = statusStyle[item.status] || { bg: '#E4E8FE', text: '#4338CA', dot: colors.primary };
          const cat = categoryMeta[item.emoji] || { icon: 'alert-circle', bg: colors.primaryLight, fg: colors.primary };
          const statusBerikut = NEXT_STATUS[item.status];
          const aksi = AKSI_STATUS[statusBerikut] || null;
          return (
            <View key={item.id} style={[styles.cardWrap, { width: isLayarLebar ? '31%' : '100%' }]}>
              <Pressable
                onPress={() => { setDetail(item); onDetail?.(item); }}
                style={[styles.card, shadow.card]}
                accessibilityRole="button"
                accessibilityLabel={`Laporan: ${item.judul}, lokasi ${item.lokasi}, status ${item.status}`}
              >
                <View style={styles.topRow}>
                  <View style={[styles.iconWrap, { backgroundColor: cat.bg }]}>
                    {item.emoji && cat.icon === undefined
                      ? <Text style={styles.emoji}>{item.emoji}</Text>
                      : <Ionicons name={cat.icon} size={22} color={cat.fg} />}
                  </View>
                  <View style={[styles.badge, { backgroundColor: st.bg }]}>
                    <View style={[styles.badgeDot, { backgroundColor: st.dot }]} />
                    <Text style={[styles.badgeText, { color: st.text }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.title} numberOfLines={2}>{item.judul}</Text>
                <View style={styles.locRow}>
                  <Ionicons name="location-outline" size={14} color={colors.muted} />
                  <Text style={styles.loc} numberOfLines={1}>{item.lokasi}</Text>
                </View>
                {item.deskripsi ? <Text style={styles.desc} numberOfLines={2}>{item.deskripsi}</Text> : null}
                <View style={styles.foot}>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color={colors.placeholder} />
                    <Text style={styles.time}>Baru saja</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Aksi cepat: lanjutkan status (mis. Dilaporkan -> Verifikasi) */}
                    {onUpdateStatus && aksi ? (
                      <Pressable
                        style={({ pressed }) => [styles.aksi, { backgroundColor: aksi.bg }, pressed && { opacity: 0.7 }]}
                        onPress={(e) => { e.stopPropagation(); onUpdateStatus(item.id, statusBerikut); }}
                        accessibilityRole="button"
                        accessibilityLabel={`${aksi.label} laporan ${item.judul}`}
                        hitSlop={6}
                      >
                        <Ionicons name={aksi.icon} size={14} color={aksi.fg} />
                        <Text style={[styles.aksiText, { color: aksi.fg }]}>{aksi.label}</Text>
                      </Pressable>
                    ) : null}
                    {onDelete ? (
                      <Pressable
                        style={({ pressed }) => [styles.del, pressed && { opacity: 0.6 }]}
                        onPress={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        accessibilityRole="button"
                        accessibilityLabel={`Hapus laporan ${item.judul}`}
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={17} color={colors.danger} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <LaporanDetailModal
        visible={!!detailFresh}
        laporan={detailFresh}
        onClose={() => setDetail(null)}
        onDelete={onDelete ? async (id) => { onDelete(id); setDetail(null); } : null}
        onUpdateStatus={onUpdateStatus}
      />
    </View>
  );
}

function SectionHead({ count }) {
  return (
    <View style={styles.head}>
      <Text style={styles.sectionTitle}>Laporan Terkini</Text>
      <View style={styles.countPill}>
        <Text style={styles.countText}>{count} laporan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: 0.2 },
  countPill: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.tintBorder, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  countText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  cardList: { gap: 14 },
  cardWrap: { width: '100%' },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#EAECF7' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 23 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6, lineHeight: 22 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  loc: { fontSize: 13.5, color: colors.muted, fontWeight: '500', flex: 1 },
  desc: { fontSize: 13, color: colors.muted, lineHeight: 18, marginTop: 4 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  time: { fontSize: 12, color: colors.placeholder, fontWeight: '500' },
  aksi: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, minHeight: 34, borderRadius: 999 },
  aksiText: { fontSize: 12, fontWeight: '800' },
  del: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { backgroundColor: colors.card, borderRadius: 20, padding: 30, borderWidth: 1, borderColor: '#EAECF7', alignItems: 'center', ...shadow.card },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 13.5, color: colors.muted, textAlign: 'center', lineHeight: 19 },
});
