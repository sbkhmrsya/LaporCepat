import React, { useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomeScreen from './screens/HomeScreen';
import type { AppScreen } from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import BuatLaporanScreen from './screens/BuatLaporanScreen';
import RiwayatScreen from './screens/RiwayatScreen';
import ProfilScreen from './screens/ProfilScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './components/SplashScreen';
import ScreenTransition from './components/ScreenTransition';
import { ToastHost } from './utils/toast';
import { getLaporan, createLaporan, deleteLaporan, updateLaporan } from './services/laporanApi';
import type { Laporan, LaporanBaru, StatusLaporan } from './services/laporanApi';
import { colors } from './theme';
import { showToast } from './utils/toast';

function Root(): React.JSX.Element {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [screen, setScreen] = useState<AppScreen>('home');
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loadingLaporan, setLoadingLaporan] = useState(false);
  const [errorLaporan, setErrorLaporan] = useState<string | Error>('');

  useEffect(() => {
    if (!user) { setScreen('home'); setAuthScreen('login'); }
  }, [user]);

  const muatLaporan = async (): Promise<void> => {
    setLoadingLaporan(true);
    setErrorLaporan('');
    try {
      setLaporan(await getLaporan());
    } catch (e: any) {
      // TASK 01: error diajukan apa adanya (ApiError: offline/4xx/5xx)
      // agar HomeScreen dapat menampilkan tampilan error sesuai jenisnya.
      setErrorLaporan(e?.message ? e : new Error('Gagal memuat laporan.'));
    } finally {
      setLoadingLaporan(false);
    }
  };

  useEffect(() => {
    if (user) muatLaporan();
  }, [user]);

  const tambahLaporan = async (laporanBaru: LaporanBaru): Promise<Laporan> => {
    const hasil = await createLaporan(laporanBaru);
    setLaporan((lama) => [hasil, ...lama]);
    setScreen('home');
    showToast('success', 'Laporan terkirim!', `${hasil.judul} tampil paling atas di Beranda.`);
    return hasil;
  };

  const hapusLaporan = async (id: string | number | null): Promise<void> => {
    await deleteLaporan(id);
    setLaporan((lama) => lama.filter((x) => String(x.id) !== String(id)));
    showToast('success', 'Laporan dihapus', 'Daftar diperbarui.');
  };

  const perbaruiStatus = async (id: string | number | null, status: StatusLaporan): Promise<Laporan> => {
    const hasil = await updateLaporan(id, { status });
    setLaporan((lama) => lama.map((x) => (String(x.id) === String(id) ? hasil : x)));
    showToast('info', 'Status diperbarui', `${hasil.judul}: ${status}`);
    return hasil;
  };

  if (showSplash || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        <StatusBar barStyle="light-content" />
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </View>
    );
  }

  if (!user) {
    return (
      <ScreenTransition>
        {authScreen === 'register'
          ? <RegisterScreen onGoLogin={() => setAuthScreen('login')} />
          : <LoginScreen onGoRegister={() => setAuthScreen('register')} />}
      </ScreenTransition>
    );
  }

  if (screen === 'buat') {
    return (
      <ScreenTransition>
        <BuatLaporanScreen onBack={() => setScreen('home')} onSubmit={tambahLaporan} />
      </ScreenTransition>
    );
  }
  if (screen === 'peta') {
    return (
      <ScreenTransition>
        <MapScreen laporan={laporan} onBack={() => setScreen('home')} onUpdateStatus={perbaruiStatus} />
      </ScreenTransition>
    );
  }
  if (screen === 'riwayat') {
    return (
      <ScreenTransition>
        <RiwayatScreen laporan={laporan} onBack={() => setScreen('home')} onDelete={hapusLaporan} onUpdateStatus={perbaruiStatus} />
      </ScreenTransition>
    );
  }
  if (screen === 'profil') {
    return (
      <ScreenTransition>
        <ProfilScreen onBack={() => setScreen('home')} laporanCount={laporan.length} onBuat={() => setScreen('buat')} />
      </ScreenTransition>
    );
  }
  return (
    <ScreenTransition>
      <HomeScreen
        laporan={laporan}
        onNavigate={setScreen}
        loading={loadingLaporan}
        error={errorLaporan}
        onRefresh={muatLaporan}
        onDelete={hapusLaporan}
        onUpdateStatus={perbaruiStatus}
      />
    </ScreenTransition>
  );
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="dark-content" />
        <Root />
        <ToastHost />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
