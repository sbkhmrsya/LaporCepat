import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomeScreen from './screens/HomeScreen';
import BuatLaporanScreen from './screens/BuatLaporanScreen';
import ProfilScreen from './screens/ProfilScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { laporanAwal } from './data/laporanAwal';
import { colors } from './theme';

function Root() {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState('login');
  const [screen, setScreen] = useState('home');
  const [laporan, setLaporan] = useState(laporanAwal);
  
  useEffect(() => {
    if (!user) { setScreen('home'); setAuthScreen('login'); }
  }, [user]);

  const tambahLaporan = (laporanBaru) => {
    setLaporan((lama) => [laporanBaru, ...lama]); // tampil paling atas
    setScreen('home');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
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
  if (screen === 'profil') {
    return <ProfilScreen onBack={() => setScreen('home')} />;
  }
  return <HomeScreen laporan={laporan} onNavigate={setScreen} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
