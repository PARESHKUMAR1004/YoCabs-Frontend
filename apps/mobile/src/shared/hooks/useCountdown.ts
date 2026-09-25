import { useCallback, useEffect, useRef, useState } from 'react';

/** Counts down from `seconds` once started; used for the "resend code" cooldown. */
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const restart = useCallback(() => {
    stop();
    setRemaining(seconds);
    timer.current = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          stop();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  }, [seconds, stop]);

  useEffect(() => {
    restart();
    return stop;
  }, [restart, stop]);

  return { remaining, restart, done: remaining === 0 };
}
