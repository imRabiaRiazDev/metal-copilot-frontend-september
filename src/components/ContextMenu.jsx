import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, items, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[100] min-w-[180px] bg-white dark:bg-navy border border-border-light dark:border-white/10 rounded-xl shadow-elevated py-1.5 animate-scaleIn"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          role="menuitem"
          onClick={item.action}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-150 focus-visible:outline-none focus-visible:bg-gold/10 ${
            item.danger
              ? 'text-danger hover:bg-danger/10'
              : 'text-slate-700 dark:text-white hover:bg-gold/10'
          }`}
        >
          {item.icon && <item.icon size={16} strokeWidth={1.5} className="shrink-0" />}
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;
