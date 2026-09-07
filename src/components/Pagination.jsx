import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZES = [10, 20, 50, 100];

const Pagination = ({ page, totalPages, total, onPageChange, pageSize, onPageSizeChange }) => {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);
    if (page <= 2) end = Math.min(4, totalPages - 1);
    if (page >= totalPages - 1) start = Math.max(totalPages - 3, 2);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  const btnBase =
    'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-1 px-1">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-slate-400 dark:text-white/60">
          {startItem}–{endItem} of {total}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 dark:text-white/60">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { onPageSizeChange(Number(e.target.value)); }}
              className="px-2 py-1 rounded-lg bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-slate-700 dark:text-white text-[10px] font-mono focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 cursor-pointer"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${btnBase} border border-border-light dark:border-white/20 text-slate-400 dark:text-white/60 hover:border-gold hover:text-gold disabled:opacity-30 disabled:pointer-events-none`}
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 text-center text-[10px] font-mono text-slate-300 dark:text-white/30">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`${btnBase} ${
                p === page
                  ? 'bg-gold text-navy shadow-gold'
                  : 'border border-border-light dark:border-white/20 text-slate-400 dark:text-white/60 hover:border-gold hover:text-gold'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={`${btnBase} border border-border-light dark:border-white/20 text-slate-400 dark:text-white/60 hover:border-gold hover:text-gold disabled:opacity-30 disabled:pointer-events-none`}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
