import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number;
}

const MOVE_TOLERANCE = 10;

// Tap = onClick, press-and-hold (or right-click) = onLongPress. Moving the finger
// (scrolling a carousel) cancels the hold so it never fires mid-scroll.
export function useLongPress({ onLongPress, onClick, threshold = 420 }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const touchRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const begin = useCallback(
    (x: number, y: number) => {
      firedRef.current = false;
      startRef.current = { x, y };
      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        timerRef.current = null;
        if (navigator.vibrate) {
          try {
            navigator.vibrate(12);
          } catch {
            // ignore
          }
        }
        onLongPress();
      }, threshold);
    },
    [clear, onLongPress, threshold],
  );

  const move = useCallback(
    (x: number, y: number) => {
      const s = startRef.current;
      if (s && (Math.abs(x - s.x) > MOVE_TOLERANCE || Math.abs(y - s.y) > MOVE_TOLERANCE)) clear();
    },
    [clear],
  );

  return {
    onTouchStart: (e: React.TouchEvent) => {
      touchRef.current = true;
      const t = e.touches[0];
      begin(t.clientX, t.clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    },
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: (e: React.MouseEvent) => {
      if (touchRef.current || e.button !== 0) return;
      begin(e.clientX, e.clientY);
    },
    onMouseMove: (e: React.MouseEvent) => {
      if (!touchRef.current) move(e.clientX, e.clientY);
    },
    onMouseUp: clear,
    onMouseLeave: clear,
    onClick: (e: React.MouseEvent) => {
      if (firedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        firedRef.current = false;
        return;
      }
      onClick?.();
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      // A touch long-press already fired; don't open the menu twice.
      if (touchRef.current) return;
      onLongPress();
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
        e.preventDefault();
        onLongPress();
      }
    },
  };
}
