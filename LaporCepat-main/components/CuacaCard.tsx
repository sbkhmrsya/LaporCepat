// ============================================================
// MODUL 3 — CUACA CARD: kartu cuaca Malang dari Open-Meteo.
// Props bertipe interface (CuacaInfo) — bukti pemakaian interface.
// Gaya mengikuti theme.ts (palet indigo–violet) seperti hero banner.
// Responsif: ukuran menyusut di layar sempit, layout jadi bertingkat
// (vertikal) di layar sangat sempit agar tetap rapi.
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadow } from '../theme';
import type { CuacaInfo } from '../types/cuaca';

export default function CuacaCard({ cuaca }: { cuaca: CuacaInfo }): React.JSX.Element {
  const { width } = useWindowDimensions();
  // Semakin sempit layar, semakin ringkas tampilan kartu.
  const sempit = width < 430;        // tablet kecil / jendela browser sempit
  const sangatSempit = width < 350;  // ponsel kecil -> layout bertingkat

  return (
    <LinearGradient
      colors={['#4338CA', '#6D5EF8', '#8B5CF6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        shadow.pop,
        sempit && styles.cardSempit,
        sangatSempit && styles.cardSangatSempit,
      ]}
    >
      <View style={styles.deco} />

      {sangatSempit ? (
        // ---- LAYAR SANGAT SEMPIT: layout bertingkat, rata kiri ----
        <>
          <View style={styles.barisAtas}>
            <View style={[styles.ikonWrap, styles.ikonWrapSempit]}>
              <Ionicons name={cuaca.ikon} size={26} color="#fff" />
            </View>
            <View style={styles.teksKondisi}>
              <Text style={styles.kondisiSempit}>{cuaca.kondisi}</Text>
              <Text style={styles.lokasi}>Cuaca Malang • Open-Meteo</Text>
            </View>
          </View>
          <View style={styles.barisBawah}>
            <Text style={styles.suhuSempit}>{Math.round(cuaca.suhu)}°</Text>
            <View style={styles.detail}>
              <View style={styles.detailItem}>
                <Ionicons name="water" size={12} color="#DDD6FE" />
                <Text style={styles.detailTextSempit}>{cuaca.kelembapan}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={12} color="#DDD6FE" />
                <Text style={styles.detailTextSempit}>{cuaca.angin} km/h</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        // ---- LAYOUT NORMAL / SEMPIT: dua kolom (kiri kondisi, kanan suhu) ----
        <>
          <View style={styles.kiri}>
            <View style={[styles.ikonWrap, sempit && styles.ikonWrapSempit]}>
              <Ionicons name={cuaca.ikon} size={sempit ? 28 : 34} color="#fff" />
            </View>
            <Text style={[styles.kondisi, sempit && styles.kondisiSempit]}>{cuaca.kondisi}</Text>
            <Text style={styles.lokasi}>Cuaca Malang • Open-Meteo</Text>
          </View>
          <View style={styles.kanan}>
            <Text style={[styles.suhu, sempit && styles.suhuSempit]}>{Math.round(cuaca.suhu)}°</Text>
            <View style={styles.detail}>
              <View style={styles.detailItem}>
                <Ionicons name="water" size={sempit ? 12 : 13} color="#DDD6FE" />
                <Text style={[styles.detailText, sempit && styles.detailTextSempit]}>
                  {cuaca.kelembapan}%
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={sempit ? 12 : 13} color="#DDD6FE" />
                <Text style={[styles.detailText, sempit && styles.detailTextSempit]}>
                  {cuaca.angin} km/h
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    marginBottom: 14,
    minHeight: 116,
  },
  cardSempit: { padding: 14, minHeight: 104 },
  cardSangatSempit: { flexDirection: 'column', alignItems: 'stretch', gap: 10, minHeight: 0 },
  deco: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.12)', top: -55, right: -35,
  },
  kiri: { flex: 1, minWidth: 0 },
  ikonWrap: {
    width: 58, height: 58, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center',
    justifyContent: 'center', marginBottom: 8,
  },
  ikonWrapSempit: { width: 46, height: 46, borderRadius: 14, marginBottom: 0 },
  kondisi: { fontSize: 16, fontWeight: '800', color: '#fff' },
  kondisiSempit: { fontSize: 14 },
  lokasi: { fontSize: 11.5, fontWeight: '600', color: '#DDD6FE', marginTop: 2 },
  kanan: { alignItems: 'flex-end', gap: 8 },
  suhu: { fontSize: 44, fontWeight: '900', color: '#fff', lineHeight: 48 },
  suhuSempit: { fontSize: 32, lineHeight: 36 },
  detail: { gap: 5 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  detailText: { fontSize: 12.5, fontWeight: '700', color: '#DDD6FE' },
  detailTextSempit: { fontSize: 11.5, fontWeight: '700', color: '#DDD6FE' },
  // Layout bertingkat (layar sangat sempit)
  barisAtas: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teksKondisi: { flex: 1, minWidth: 0 },
  barisBawah: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)', paddingTop: 8,
  },
});
