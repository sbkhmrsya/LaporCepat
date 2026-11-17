import { useEffect, useState } from 'react';

declare const require: (m: string) => any;

type NetInfoState = { isConnected?: boolean | null; isInternetReachable?: boolean | null };
type NetInfoModule = {
  fetch: () => Promise<NetInfoState>;
  addEventListener: (cb: (s: NetInfoState) => void) => () => void;
};

let NetInfo: NetInfoModule | null = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  NetInfo = null;
}

export const netinfoTerpasang = (): boolean => !!NetInfo;

function statusOnline(state: NetInfoState | null): boolean {
  if (!state) return true;
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}


// Hook React: mengembalikan true bila perangkat terhubung internet.
export function useConnectivity(defaultOnline = true): boolean {
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
