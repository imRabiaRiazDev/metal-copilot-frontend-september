import React from 'react';

const PageHeader = ({ icon: Icon, title, accent, subtitle, actions }) => (
  <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 mb-8">
    <div className="min-w-0">
      <h1 className="text-3xl font-bold text-slate-700 dark:text-white mb-1">
        {Icon && <Icon size={28} className="inline mr-2 text-gold align-[-5px]" strokeWidth={1.5} />}
        {title}
        {accent && <span className="text-gold"> {accent}</span>}
      </h1>
      {subtitle && <p className="text-sm text-slate-400 dark:text-white/60">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

export default PageHeader;
