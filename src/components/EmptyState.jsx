import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeInUp">
    <div className="relative mb-6">
      <div className="absolute inset-0 rounded-full bg-gold/10 blur-2xl" />
      <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-navy border border-border-light dark:border-white/10 flex items-center justify-center shadow-card">
        {Icon ? (
          <Icon size={32} strokeWidth={1.25} className="text-gold" />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-gold">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        )}
      </div>
    </div>
    <h3 className="text-xl font-semibold text-slate-700 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 dark:text-white/60 max-w-md mb-6 leading-relaxed">
      {description}
    </p>
    {action && (
      <button
        onClick={action}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-navy rounded-lg text-sm font-semibold hover:bg-gold-dark hover:shadow-gold active:scale-[0.97] transition-all duration-200"
      >
        {actionLabel || 'Get Started'}
      </button>
    )}
  </div>
);

export default EmptyState;
