import { Alert } from 'react-native';
import { userMessage } from '@yocabs/api-client';

/** Native confirmation dialog as a promise (true = confirmed). */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = 'Confirm',
  destructive = false,
): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export function showError(error: unknown, title = 'Something went wrong'): void {
  Alert.alert(title, userMessage(error));
}

export function showInfo(title: string, message?: string): void {
  Alert.alert(title, message);
}
