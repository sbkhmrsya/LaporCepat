// ============================================================
// KONEKTIVITAS (TASK 03 — HANDLE OFFLINE)
// Mendeteksi ada/tidaknya internet agar UI bisa menampilkan
// tampilan offline yang jelas.
//  - Bila @react-native-community/netinfo terpasang (Expo Go:
//    `npx expo install @react-native-community/netinfo`),
//    dipakai listener real-time.
//  - Bila tidak, fallback: anggap online, dan request yang gagal
//    tetap terdeteksi offline di apiClient (network error).
// ============================================================
import { useEffect, useState } from 'react';

let NetInfo = null;
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  NetInfo = null;
}

export const netinfoTerpasang = () => !!NetInfo;

function statusOnline(state) {
  if (!state) return true;
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

// Hook React: mengembalikan true bila perangkat terhubung internet.
export function useConnectivity(defaultOnline = true) {
  const [online, setOnline] = useState(defaultOnline);

  useEffect(() => {
    if (!NetInfo) return undefined;
    let aktif = true;
    NetInfo.fetch().then((s) => { if (aktif) setOnline(statusOnline(s)); });
    const unsubscribe = NetInfo.addEventListener((s) => {
      if (aktif) setOnline(statusOnline(s));
    });
    return () => { aktif = false; unsubscribe(); };
  }, []);

  return online;
}
