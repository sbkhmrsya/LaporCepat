import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Android: Keystore, iOS: Keychain. Web tidak punya secure storage sungguhan,
// jadi hanya jatuh ke localStorage untuk keperluan pengembangan.
const OPTS = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const isWeb = Platform.OS === 'web';

export const storage = {
  async get(key) {
    if (isWeb) {
      try { return window.localStorage.getItem(key); } catch { return null; }
    }
    return SecureStore.getItemAsync(key, OPTS);
  },
  async set(key, value) {
    if (isWeb) {
      try { window.localStorage.setItem(key, value); } catch {}
      return;
    }
    await SecureStore.setItemAsync(key, value, OPTS);
  },
  async remove(key) {
    if (isWeb) {
      try { window.localStorage.removeItem(key); } catch {}
      return;
    }
    await SecureStore.deleteItemAsync(key, OPTS);
  },
};
