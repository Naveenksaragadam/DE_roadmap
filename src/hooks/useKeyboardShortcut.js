import { useEffect, useCallback } from 'react';

export function useKeyboardShortcut(key, callback, modifiers = { meta: true }) {
  const handler = useCallback(
    (e) => {
      const metaMatch = modifiers.meta ? (e.metaKey || e.ctrlKey) : true;
      const shiftMatch = modifiers.shift ? e.shiftKey : true;

      if (metaMatch && shiftMatch && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback(e);
      }
    },
    [key, callback, modifiers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
