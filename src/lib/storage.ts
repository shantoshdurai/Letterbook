import { useCallback, useEffect, useRef, useState } from 'react';

// Everything Letterbook stores lives under this prefix so it can be exported,
// wiped or migrated as a unit.
export const STORAGE_PREFIX = 'letterbook';

export function storageKey(...parts: string[]) {
  return [STORAGE_PREFIX, ...parts].join(':');
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded or storage disabled (private mode); state still works in memory.
    return false;
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function keysWithPrefix(prefix: string): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) out.push(k);
    }
  } catch {
    // ignore
  }
  return out;
}

type Initial<T> = T | (() => T);

// useState that survives reloads. Writes are debounced to a microtask-ish delay
// so rapid updates (typing, toggles) don't hammer localStorage.
export function usePersistentState<T>(key: string, initial: Initial<T>) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === 'function' ? (initial as () => T)() : initial;
    return readJSON<T>(key, fallback);
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => writeJSON(key, latest.current), 120);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, value]);

  // Flush pending writes if the page is being hidden/closed.
  useEffect(() => {
    const flush = () => writeJSON(key, latest.current);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
    };
  }, [key]);

  const set = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, set] as const;
}
