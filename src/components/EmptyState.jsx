import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-20 h-20 rounded-full bg-ivory dark:bg-navy-light border border-border-light dark:border-white/10 flex items-center justify-center mb-6">
      {Icon ? (
        <Icon size={36} strokeWidth={1} className="text-gold" />
      ) : (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )}
    </div>
    <h3 className="text-xl font-semibold text-slate-700 dark:text-white mb-2 text-center">{title}</h3>
    <p className="text-sm text-slate-400 dark:text-white/60 text-center max-w-md mb-6">
      {description}
    </p>
    {action && (
      <button
        onClick={action}
        className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white rounded-lg text-sm font-semibold hover:bg-gold-dark transition-all duration-200 shadow-gold"
      >
        {actionLabel || 'Get Started'}
      </button>
    )}
  </div>
);

export default EmptyState;
