import React, { useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import BuatLaporanScreen from './screens/BuatLaporanScreen';
import ProfilScreen from './screens/ProfilScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './components/SplashScreen';
import { getLaporan, createLaporan, deleteLaporan, updateLaporan } from './services/laporanApi';
import { colors } from './theme';

function Root() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [authScreen, setAuthScreen] = useState('login');
  const [screen, setScreen] = useState('home');
  const [laporan, setLaporan] = useState([]);
  const [loadingLaporan, setLoadingLaporan] = useState(false);
  const [errorLaporan, setErrorLaporan] = useState('');

  useEffect(() => {
    if (!user) { setScreen('home'); setAuthScreen('login'); }
  }, [user]);

  const muatLaporan = async () => {
    setLoadingLaporan(true);
    setErrorLaporan('');
    try {
      setLaporan(await getLaporan());
    } catch (e) {
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

  const tambahLaporan = async (laporanBaru) => {
    const hasil = await createLaporan(laporanBaru);
    setLaporan((lama) => [hasil, ...lama]);
    setScreen('home');
    return hasil;
  };

  const hapusLaporan = async (id) => {
    await deleteLaporan(id);
    setLaporan((lama) => lama.filter((x) => String(x.id) !== String(id)));
  };

  const perbaruiStatus = async (id, status) => {
    const hasil = await updateLaporan(id, { status });
    setLaporan((lama) => lama.map((x) => (String(x.id) === String(id) ? hasil : x)));
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
    return authScreen === 'register'
      ? <RegisterScreen onGoLogin={() => setAuthScreen('login')} />
      : <LoginScreen onGoRegister={() => setAuthScreen('register')} />;
  }

  if (screen === 'buat') {
    return <BuatLaporanScreen onBack={() => setScreen('home')} onSubmit={tambahLaporan} />;
  }
  if (screen === 'peta') {
    return <MapScreen laporan={laporan} onBack={() => setScreen('home')} onUpdateStatus={perbaruiStatus} />;
  }
  if (screen === 'profil') {
    return <ProfilScreen onBack={() => setScreen('home')} laporanCount={laporan.length} onBuat={() => setScreen('buat')} />;
  }
  return (
    <HomeScreen
      laporan={laporan}
      onNavigate={setScreen}
      loading={loadingLaporan}
      error={errorLaporan}
      onRefresh={muatLaporan}
      onDelete={hapusLaporan}
      onUpdateStatus={perbaruiStatus}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
