import { useEffect, useState } from 'react';

/** Whole seconds left until `iso` (0 once passed). Ticks every second. */
export function useSecondsUntil(iso: string | null | undefined): number {
  const target = iso ? new Date(iso).getTime() : 0;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  return target ? Math.max(0, Math.ceil((target - now) / 1000)) : 0;
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
