import { useEffect } from 'react';

const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
      const key = e.key.toLowerCase();

      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        handlers.openCommand?.();
        return;
      }

      if (!e.metaKey && !e.ctrlKey && key === 'n') {
        e.preventDefault();
        handlers.newContact?.();
        return;
      }

      if (!e.metaKey && !e.ctrlKey && key === 'd') {
        e.preventDefault();
        handlers.newDeal?.();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};

export default useKeyboardShortcuts;
