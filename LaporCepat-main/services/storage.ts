import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const OPTS: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const isWeb = Platform.OS === 'web';

export const storage = {
  async get(key: string): Promise<string | null> {
    if (isWeb) {
      try { return window.localStorage.getItem(key); } catch { return null; }
    }
    return SecureStore.getItemAsync(key, OPTS);
  },
  async set(key: string, value: string): Promise<void> {
    if (isWeb) {
      try { window.localStorage.setItem(key, value); } catch { /* abaikan */ }
      return;
    }
    await SecureStore.setItemAsync(key, value, OPTS);
  },
  async remove(key: string): Promise<void> {
    if (isWeb) {
      try { window.localStorage.removeItem(key); } catch { /* abaikan */ }
      return;
    }
    await SecureStore.deleteItemAsync(key, OPTS);
  },
};
