import React, { useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Modal, Image, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraType, CameraMode, FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';

export interface FotoLaporan {
  uri: string;
  takenAt: number;
}

export default function CameraSheet({ visible, onClose, onConfirm }: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (foto: FotoLaporan) => void;
}): React.JSX.Element {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [hasil, setHasil] = useState<FotoLaporan | null>(null);
  const [snap, setSnap] = useState(false);

  const ambil = async (): Promise<void> => {
    if (!camera.current || snap) return;
    setSnap(true);
    try {
      const foto = await camera.current.takePictureAsync({ quality: 0.7, skipProcessing: true });
      if (foto?.uri) setHasil({ uri: foto.uri, takenAt: Date.now() });
    } finally {
      setSnap(false);
    }
  };

  const tutup = (): void => { setHasil(null); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={tutup}>
      <View style={styles.root}>
        {/* ---------- KASE IZIN ---------- */}
        {permission == null ? (
          <View style={styles.center}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.hintText}>Memeriksa izin kamera…</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <View style={styles.permIcon}>
              <Ionicons name="camera-outline" size={34} color={colors.primary} />
            </View>
            <Text style={styles.permTitle}>Izin Kamera</Text>
            <Text style={styles.permText}>
              LaporCepat membutuhkan akses kamera untuk mengambil foto bukti kerusakan.
              Tidak ada foto yang dikirim tanpa izin Anda.
            </Text>
            <Pressable style={styles.permBtn} onPress={requestPermission} accessibilityRole="button" accessibilityLabel="Izinkan kamera">
              <Ionicons name="shield-checkmark" size={18} color="#fff" />
              <Text style={styles.permBtnText}>Izinkan Kamera</Text>
            </Pressable>
            <Pressable onPress={tutup} style={styles.skipBtn} accessibilityRole="button" accessibilityLabel="Nanti saja">
              <Text style={styles.skipText}>Nanti saja</Text>
            </Pressable>
          </View>
        ) : hasil ? (
          /* ---------- PREVIEW HASIL FOTO ---------- */
          <View style={{ flex: 1 }}>
            <Image source={{ uri: hasil.uri }} style={styles.preview} />
            <View style={styles.previewBar}>
              <Pressable style={styles.previewBtnOutline} onPress={() => setHasil(null)} accessibilityRole="button" accessibilityLabel="Ambil ulang">
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.previewBtnOutlineText}>Ambil Ulang</Text>
              </Pressable>
              <Pressable
                style={styles.previewBtn}
                onPress={() => { onConfirm(hasil); setHasil(null); }}
                accessibilityRole="button"
                accessibilityLabel="Gunakan foto ini"
              >
                <Ionicons name="checkmark" size={18} color={colors.primary} />
                <Text style={[styles.previewBtnOutlineText, { color: colors.primary }]}>Gunakan Foto</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* ---------- KAMERA ---------- */
          <View style={{ flex: 1 }}>
            <CameraView
              ref={camera}
              style={styles.cam}
              facing={facing}
              flash={flash}
              mode="picture"
              autofocus="on"
            />
            <View style={[styles.camTop, { paddingTop: 14 }]}>
              <Pressable style={styles.ghostBtn} onPress={tutup} accessibilityRole="button" accessibilityLabel="Tutup kamera">
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
              <Text style={styles.camTitle}>Ambil Foto Bukti</Text>
              <Pressable
                style={styles.ghostBtn}
                onPress={() => setFlash((f) => (f === 'on' ? 'off' : 'on'))}
                accessibilityRole="button"
                accessibilityLabel={flash === 'on' ? 'Matikan lampu' : 'Nyalakan lampu'}
              >
                <Ionicons name={flash === 'on' ? 'flash' : 'flash-outline'} size={22} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.camBottom}>
              <Pressable style={styles.sideBtn} onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} accessibilityRole="button" accessibilityLabel="Balik kamera">
                <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
              </Pressable>
              <Pressable
                style={[styles.shutter, snap && { opacity: 0.5 }]}
                onPress={ambil}
                accessibilityRole="button"
                accessibilityLabel="Ambil foto"
              >
                <View style={styles.shutterInner} />
              </Pressable>
              <View style={styles.sideBtn} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B12' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  permIcon: { width: 76, height: 76, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 6, ...shadow.pop },
  permTitle: { fontSize: 19, fontWeight: '900', color: '#fff' },
  permText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 19 },
  permBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingHorizontal: 22, minHeight: 50, borderRadius: 15, marginTop: 8 },
  permBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  skipBtn: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 16 },
  skipText: { color: 'rgba(255,255,255,0.55)', fontWeight: '600', fontSize: 13 },
  cam: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  camTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  camTitle: { fontSize: 14, fontWeight: '800', color: '#fff', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  ghostBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  camBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 26, paddingBottom: 30 },
  sideBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  preview: { flex: 1, backgroundColor: '#0B0B12' },
  previewBar: {
    flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 30,
    backgroundColor: '#0B0B12', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
  },
  previewBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 52, borderRadius: 15, backgroundColor: '#fff' },
  previewBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 52, borderRadius: 15, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  previewBtnOutlineText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  hintText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
});
