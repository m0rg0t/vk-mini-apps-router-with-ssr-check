import { Context, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ThrottledContext } from '../contexts';

type NullableFunction = (() => void) | null;

const EMPTY_FUNCTION = () => {};

export function useThrottledContext<T>(context: Context<T>): [T, T | null, () => void] {
  const { enabled, interval, firstActionDelay } = useContext(ThrottledContext);
  const prevValue = useRef<T | null>(null);
  const value = useContext(context);
  const updated = useRef(0);
  const updateTimer = useRef(0);
  const updateCallback = useRef<NullableFunction>(null);
  const [throttledValue, setThrottledValue] = useState<T>(value);

  const latestThrottledValue = useRef(throttledValue);
  latestThrottledValue.current = throttledValue;

  useEffect(() => {
    if (!enabled) {
      updateCallback.current = null;
      setThrottledValue(value);
      return;
    }
    const timeDiff = Date.now() - updated.current;
    const throttleDelay = interval - timeDiff;
    const initialDelay = throttleDelay <= 0 ? firstActionDelay : 0;
    const delay = Math.max(initialDelay, throttleDelay);
    prevValue.current = latestThrottledValue.current;

    if (delay <= 0) {
      updated.current = Date.now();
      setThrottledValue(value);
    } else {
      clearTimeout(updateTimer.current);
      updateCallback.current = () => {
        updateCallback.current = null;
        updated.current = Date.now();
        setThrottledValue(value);
      };
      updateTimer.current = setTimeout(updateCallback.current, delay);
    }

    return () => clearTimeout(updateTimer.current);
  }, [value, enabled, interval, firstActionDelay]);

  const onTransitionEnd = useCallback(() => {
    updated.current = 0;
    if (updateCallback.current) {
      clearTimeout(updateTimer.current);
      updateTimer.current = setTimeout(updateCallback.current, 1);
    }
    return () => clearTimeout(updateTimer.current);
  }, []);

  if (!enabled) {
    const returnPrev = prevValue.current;
    prevValue.current = value;
    return [value, returnPrev, EMPTY_FUNCTION];
  }
  const returnPrev = prevValue.current;
  return [throttledValue, returnPrev, onTransitionEnd];
}
