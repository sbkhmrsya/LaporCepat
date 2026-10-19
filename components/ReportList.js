import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow, statusStyle, categoryMeta } from '../theme';
import LaporanDetailModal from './LaporanDetailModal';

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
}) {
  const [detail, setDetail] = useState(null);

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
          const st = statusStyle[item.status] || { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' };
          const cat = categoryMeta[item.emoji] || { icon: 'alert-circle', bg: '#FFF1E6', fg: colors.primary };
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
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <LaporanDetailModal
        visible={!!detail}
        laporan={detail}
        onClose={() => setDetail(null)}
        onDelete={onDelete ? async (id) => { onDelete(id); setDetail(null); } : null}
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
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F3EEE7' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 23 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6, lineHeight: 22 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  loc: { fontSize: 13.5, color: colors.muted, fontWeight: '500', flex: 1 },
  desc: { fontSize: 13, color: '#78716C', lineHeight: 18, marginTop: 4 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F1EA' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  time: { fontSize: 12, color: colors.placeholder, fontWeight: '500' },
  del: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { backgroundColor: colors.card, borderRadius: 20, padding: 30, borderWidth: 1, borderColor: '#F3EEE7', alignItems: 'center', ...shadow.card },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 13.5, color: colors.muted, textAlign: 'center', lineHeight: 19 },
});
