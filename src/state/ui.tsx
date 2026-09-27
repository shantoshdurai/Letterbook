import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Book, Review } from '../types';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

// Screens that slide over the tab screens. Each is pushed onto a stack and
// mirrored into browser history so the Android back button / swipe-back and
// the browser back button close the top overlay instead of leaving the app.
export type Overlay =
  | { type: 'book'; book: Book }
  | { type: 'list'; listId: string }
  | { type: 'article'; articleId: string }
  | { type: 'log'; bookId?: string; logId?: string }
  | { type: 'share'; bookId: string; review?: Review | null; justLogged?: boolean }
  | { type: 'quickMenu'; bookId: string }
  | { type: 'genre'; name: string }
  | { type: 'grid'; title: string; subtitle?: string; bookIds?: string[]; source?: 'trending' | 'new' | 'foryou' | 'author'; authorOf?: Book; emptyText?: string }
  | { type: 'reviews' }
  | { type: 'notifications' }
  | { type: 'settings' }
  | { type: 'createList'; initialBookId?: string; editListId?: string };

interface ToastState {
  id: number;
  message: string;
  tone: 'success' | 'error';
  action?: { label: string; onClick: () => void };
}

interface ConfirmState {
  title: string;
  body?: string;
  confirmLabel?: string;
  destructive?: boolean;
  resolve: (ok: boolean) => void;
}

interface UIContextValue {
  stack: Overlay[];
  open: (o: Overlay) => void;
  replaceTop: (o: Overlay) => void;
  close: () => void;
  closeAll: () => void;
  toast: (message: string, opts?: { tone?: 'success' | 'error'; action?: ToastState['action'] }) => void;
  confirm: (opts: Omit<ConfirmState, 'resolve'>) => Promise<boolean>;
}

const UIContext = createContext<UIContextValue | null>(null);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<Overlay[]>([]);
  const [toastState, setToastState] = useState<ToastState | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const depthRef = useRef(0);
  depthRef.current = stack.length;

  useEffect(() => {
    const onPop = () => {
      setStack((s) => (s.length ? s.slice(0, -1) : s));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Escape closes the top-most layer (confirm dialog first).
  const confirmRef = useRef<ConfirmState | null>(null);
  confirmRef.current = confirmState;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirmRef.current) {
        confirmRef.current.resolve(false);
        setConfirmState(null);
      } else if (depthRef.current) {
        closeRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock page scroll behind overlays.
  useEffect(() => {
    document.body.style.overflow = stack.length ? 'hidden' : '';
  }, [stack.length]);

  const open = useCallback((o: Overlay) => {
    setStack((s) => [...s, o]);
    try {
      history.pushState({ letterbookOverlay: depthRef.current + 1 }, '');
    } catch {
      // ignore (sandboxed iframes)
    }
  }, []);

  const replaceTop = useCallback((o: Overlay) => {
    setStack((s) => (s.length ? [...s.slice(0, -1), o] : [o]));
    if (depthRef.current === 0) {
      try {
        history.pushState({ letterbookOverlay: 1 }, '');
      } catch {
        // ignore
      }
    }
  }, []);

  const close = useCallback(() => {
    if (depthRef.current === 0) return;
    // history.back() fires popstate, which pops the stack.
    const st = history.state as { letterbookOverlay?: number } | null;
    if (st?.letterbookOverlay) history.back();
    else setStack((s) => s.slice(0, -1));
  }, []);

  const closeRef = useRef(close);
  closeRef.current = close;

  const closeAll = useCallback(() => {
    const n = depthRef.current;
    if (!n) return;
    const st = history.state as { letterbookOverlay?: number } | null;
    if (st?.letterbookOverlay) history.go(-Math.min(n, st.letterbookOverlay));
    setStack([]);
  }, []);

  const toast = useCallback<UIContextValue['toast']>((message, opts) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastState({ id: Date.now(), message, tone: opts?.tone || 'success', action: opts?.action });
    toastTimer.current = setTimeout(() => setToastState(null), opts?.action ? 4500 : 2600);
  }, []);

  const confirm = useCallback<UIContextValue['confirm']>(
    (opts) => new Promise<boolean>((resolve) => setConfirmState({ ...opts, resolve })),
    [],
  );

  const answer = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  return (
    <UIContext.Provider value={{ stack, open, replaceTop, close, closeAll, toast, confirm }}>
      {children}

      {toastState && (
        <div
          key={toastState.id}
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 bottom-nav-offset z-[80] w-[calc(100%-2rem)] max-w-sm px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-toastIn ${
            toastState.tone === 'error' ? 'bg-[#3a1c1c] text-[#ffb4b4] border border-[#6b2b2b]' : 'bg-[#1f2a36] text-white border border-[#2f4054]'
          }`}
          style={{ transform: 'translateX(-50%)' }}
        >
          {toastState.tone === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#ff6b6b]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15E558]" />
          )}
          <span className="flex-1 leading-snug">{toastState.message}</span>
          {toastState.action && (
            <button
              type="button"
              onClick={() => {
                toastState.action?.onClick();
                setToastState(null);
              }}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-[#15E558] text-black font-bold"
            >
              {toastState.action.label}
            </button>
          )}
        </div>
      )}

      {confirmState && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="w-full max-w-xs rounded-2xl bg-[#1a222c] border border-[#2c3a4a] p-5 space-y-3 shadow-2xl animate-slideUp">
            <h2 id="confirm-title" className="text-sm font-bold text-white">{confirmState.title}</h2>
            {confirmState.body && <p className="text-xs text-[#9fb0c3] leading-relaxed">{confirmState.body}</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => answer(false)} className="flex-1 py-2.5 rounded-xl bg-[#243140] text-xs font-semibold text-[#cbd6e2]">
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => answer(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${confirmState.destructive ? 'bg-[#e5484d] text-white' : 'bg-[#15E558] text-black'}`}
              >
                {confirmState.confirmLabel || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
};

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
}
