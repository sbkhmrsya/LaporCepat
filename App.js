import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import BuatLaporanScreen from './screens/BuatLaporanScreen';
import { laporanAwal } from './data/laporanAwal';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [laporan, setLaporan] = useState(laporanAwal);

  const tambahLaporan = (laporanBaru) => {
    setLaporan((lama) => [laporanBaru, ...lama]); // tampil paling atas
    setScreen('home');
  };

  if (screen === 'buat') {
    return (
      <BuatLaporanScreen
        onBack={() => setScreen('home')}
        onSubmit={tambahLaporan}
      />
    );
  }
  return <HomeScreen laporan={laporan} onNavigate={setScreen} />;
}
