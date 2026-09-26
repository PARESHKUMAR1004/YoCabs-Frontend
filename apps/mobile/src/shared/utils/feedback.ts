import { userMessage } from '@yocabs/api-client';
import { useDialogs, type DialogRequest } from '@/shared/ui/dialog.store';

let nextId = 0;

/** Puts a dialog on screen and resolves with what the person chose (true = the main button). */
function ask(request: Omit<DialogRequest, 'id' | 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => {
    useDialogs.getState().push({ ...request, id: ++nextId, resolve });
  });
}

/** Confirmation dialog as a promise (true = confirmed). */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = 'Confirm',
  destructive = false,
): Promise<boolean> {
  return ask({ tone: 'confirm', title, message, confirmLabel, cancelLabel: 'Cancel', destructive });
}

export function showError(error: unknown, title = 'Something went wrong'): void {
  void ask({ tone: 'error', title, message: userMessage(error), confirmLabel: 'OK' });
}

export function showInfo(title: string, message?: string): void {
  void ask({ tone: 'info', title, message, confirmLabel: 'OK' });
}
