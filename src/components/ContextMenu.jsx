import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, items, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] bg-white dark:bg-navy border border-border-light dark:border-white/10 rounded-xl shadow-card py-1 animate-fadeInUp"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={item.action}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
            item.danger
              ? 'text-danger hover:bg-danger/10'
              : 'text-slate-700 dark:text-white hover:bg-gold/10'
          }`}
        >
          {item.icon && <item.icon size={16} strokeWidth={1.5} />}
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;
