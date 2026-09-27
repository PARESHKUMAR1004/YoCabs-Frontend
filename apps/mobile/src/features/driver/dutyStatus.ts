import { create } from 'zustand';

export type DutyState =
  /** No trip to share for. */
  | 'off'
  | 'starting'
  /** The driver's location is being shared. */
  | 'on'
  /** Location is needed and cannot be had: permission missing or refused. */
  | 'blocked';

interface DutyStatus {
  state: DutyState;
  reason: string | null;
  /** Bumped to make the tracker try again, e.g. after the driver allowed location. */
  attempt: number;
  set: (state: DutyState, reason?: string | null) => void;
  retry: () => void;
}

/** Whether the driver's location is being shared, for the screens that need to say so. */
export const useDutyStatus = create<DutyStatus>((set) => ({
  state: 'off',
  reason: null,
  attempt: 0,
  set: (state, reason = null) => set({ state, reason }),
  retry: () => set((current) => ({ attempt: current.attempt + 1 })),
}));
