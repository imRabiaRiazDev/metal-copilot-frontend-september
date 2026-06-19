import React from 'react';

const Skeleton = ({ rows = 4, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded skeleton-shimmer w-3/4" />
          <div className="h-3 rounded skeleton-shimmer w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="border border-border-light dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-navy">
    <div className="px-5 py-3.5 border-b border-border-light dark:border-white/10 bg-ivory dark:bg-navy-light">
      <div className="flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 rounded skeleton-shimmer flex-1" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="px-5 py-4 border-b border-border-light dark:border-white/5">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className={`h-3 rounded skeleton-shimmer ${c === 0 ? 'w-1/4' : 'flex-1'}`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
