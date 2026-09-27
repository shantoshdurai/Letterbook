import { useCallback, useEffect, useRef, useState } from 'react';
import { Book } from '../types';

interface AsyncBooks {
  books: Book[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// Loads a shelf of books. `initial` (e.g. a disk-cached copy) renders immediately
// while the loader refreshes in the background.
export function useAsyncBooks(key: string | null, loader: () => Promise<Book[]>, initial?: Book[] | null): AsyncBooks {
  const [books, setBooks] = useState<Book[]>(initial || []);
  const [loading, setLoading] = useState(Boolean(key));
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    loaderRef.current()
      .then((b) => {
        if (!cancelled) setBooks(b);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(navigator.onLine === false ? 'You are offline.' : err.message || 'Could not load books.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { books, loading, error, retry };
}

export function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}
