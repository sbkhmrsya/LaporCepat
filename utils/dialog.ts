import { Alert, Platform } from 'react-native';
import { showToast } from './toast';

// Notifikasi dipakai lewat toast halus di atas layar (bukan Alert kasar).
export function notify(title: string, message: string): void {
  showToast('info', title, message);
}

export function confirmDialog(title: string, message: string, okText = 'Ya'): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
      { text: okText, style: 'destructive', onPress: () => resolve(true) },
    ])
  );
}
