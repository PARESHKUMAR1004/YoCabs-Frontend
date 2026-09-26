import { create } from 'zustand';

export type DialogTone = 'info' | 'error' | 'confirm';

export interface DialogRequest {
  id: number;
  tone: DialogTone;
  title: string;
  message?: string;
  /** Small print for support: the technical reason behind an error. */
  detail?: string;
  confirmLabel: string;
  /** Present only on questions; a notice has just the one button. */
  cancelLabel?: string;
  destructive?: boolean;
  resolve: (confirmed: boolean) => void;
}

interface DialogState {
  queue: DialogRequest[];
  push: (request: DialogRequest) => void;
  /** Closes the dialog on screen and tells whoever asked what the person chose. */
  answer: (confirmed: boolean) => void;
}

/** Dialogs wait their turn: a second one never replaces the first before it is answered. */
export const useDialogs = create<DialogState>((set, get) => ({
  queue: [],
  push: (request) => set((state) => ({ queue: [...state.queue, request] })),
  answer: (confirmed) => {
    const [current, ...rest] = get().queue;
    if (!current) return;
    set({ queue: rest });
    current.resolve(confirmed);
  },
}));
