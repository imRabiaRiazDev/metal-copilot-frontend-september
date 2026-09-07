import React, { useRef, useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const pad = (n) => String(n).padStart(2, '0');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MINUTE_STEPS = [0, 10, 20, 30, 40, 50];

const snapMinute = (m) => (Math.round(m / 10) * 10) % 60;

const clampDay = (y, m, d) => Math.min(Math.max(1, d), new Date(y, m + 1, 0).getDate());

const toDisplay = (iso) => {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return '';
  let hh = +m[4];
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return `${m[3]}/${m[2]}/${m[1]} ${pad(hh)}:${m[5]} ${ampm}`;
};

const toISO = (display) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})(?:\s?([AP])M?)?$/i.exec(display.trim());
  if (!m) return null;
  const dd = +m[1], mm = +m[2], yyyy = +m[3];
  let hh = +m[4];
  const meridiem = m[6];
  if (meridiem) {
    if (/p/i.test(meridiem)) hh = hh % 12 + 12;
    else hh = hh % 12;
  } else {
    if (hh > 23) return null;
  }
  const mi = +m[5];
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 1000 || yyyy > 9999 || mi > 59) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getDate() !== dd || d.getMonth() !== mm - 1 || d.getFullYear() !== yyyy) return null;
  return `${yyyy}-${pad(mm)}-${pad(dd)}T${pad(hh)}:${pad(mi)}`;
};

const HourSelector = ({ value, onChange }) => (
  <select
    value={value % 12 || 12}
    onChange={(e) => {
      let h = +e.target.value;
      if (value >= 12) h = h === 12 ? 12 : h + 12;
      onChange(h);
    }}
    className="px-2 py-1.5 rounded bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-sm text-slate-700 dark:text-white focus:outline-none focus:border-gold"
  >
    {Array.from({ length: 12 }, (_, i) => (
      <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
    ))}
  </select>
);

const MinuteSelector = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(+e.target.value)}
    className="px-2 py-1.5 rounded bg-ivory dark:bg-navy-light border border-border-light dark:border-white/20 text-sm text-slate-700 dark:text-white focus:outline-none focus:border-gold"
  >
    {MINUTE_STEPS.map((m) => (
      <option key={m} value={m}>{pad(m)}</option>
    ))}
  </select>
);

const DateTimePanel = ({ value, onChange, onClose, header = '' }) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value || '');
  const now = new Date();
  const [year, setYear] = useState(m ? +m[1] : now.getFullYear());
  const [month, setMonth] = useState(m ? +m[2] - 1 : now.getMonth());
  const [day, setDay] = useState(m ? +m[3] : now.getDate());
  const [hour, setHour] = useState(m ? +m[4] : now.getHours());
  const [minute, setMinute] = useState(snapMinute(m ? +m[5] : now.getMinutes()));

  const shiftMonth = (delta) => {
    const m0 = new Date(year, month + delta, 1);
    setYear(m0.getFullYear());
    setMonth(m0.getMonth());
    setDay(clampDay(m0.getFullYear(), m0.getMonth(), day));
  };

  const toggleMeridiem = () => {
    setHour((h) => (h >= 12 ? h - 12 : h === 0 ? 12 : h + 12));
  };

  const apply = () => {
    const iso = toISO(`${pad(clampDay(year, month, day))}/${pad(month + 1)}/${year} ${pad(hour % 12 || 12)}:${pad(minute)} ${hour >= 12 ? 'PM' : 'AM'}`);
    if (iso) {
      onChange(iso);
      onClose?.();
    }
  };

  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="w-full bg-white dark:bg-navy rounded-xl shadow-elevated border border-border-light dark:border-white/10 p-3">
      {header && (
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60 mb-1.5">
          {header}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-white">
          {MONTHS[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => shiftMonth(-1)} className="p-1 rounded text-slate-400 dark:text-white/60 hover:text-gold hover:bg-gold/10" aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={() => shiftMonth(1)} className="p-1 rounded text-slate-400 dark:text-white/60 hover:text-gold hover:bg-gold/10" aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-center text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          const isSelected = d === day;
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return d === null ? (
            <span key={`b${i}`} />
          ) : (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={`h-8 rounded text-xs flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-gold text-navy font-semibold'
                  : isToday
                    ? 'bg-gold/10 text-gold font-semibold'
                    : 'text-slate-600 dark:text-white/80 hover:bg-gold/10 hover:text-gold'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-border-light dark:border-white/10 pt-2 mb-2">
        <Clock size={12} className="text-slate-400 dark:text-white/60" />
        <HourSelector value={hour} onChange={setHour} />
        <span className="text-slate-400 dark:text-white/60">:</span>
        <MinuteSelector value={minute} onChange={setMinute} />
        <button
          type="button"
          onClick={toggleMeridiem}
          className={`px-2 py-1.5 rounded text-sm font-semibold border transition-colors ${
            hour >= 12
              ? 'bg-gold/10 text-gold border-gold/30'
              : 'text-slate-400 dark:text-white/60 border-border-light dark:border-white/20 hover:text-gold'
          }`}
        >
          {hour >= 12 ? 'PM' : 'AM'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            const n = new Date();
            setYear(n.getFullYear());
            setMonth(n.getMonth());
            setDay(n.getDate());
            setHour(n.getHours());
            setMinute(snapMinute(n.getMinutes()));
          }}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 dark:text-white/60 border border-border-light dark:border-white/20 hover:text-gold hover:border-gold/30 transition-all"
        >
          Today
        </button>
        <button
          type="button"
          onClick={apply}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold text-navy hover:bg-gold-dark transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const DateTimeInput = ({ value, onChange, className = '', placeholder = 'DD/MM/YYYY hh:mm AM', controlOnly = false, onRequestOpen = null }) => {
  const [text, setText] = useState(toDisplay(value));
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setText(toDisplay(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const finalize = (display) => {
    const iso = toISO(display);
    if (iso) {
      onChange(iso);
      setText(toDisplay(iso));
      setInvalid(false);
      return true;
    }
    setInvalid(true);
    return false;
  };

  const handleTextChange = (e) => {
    const raw = e.target.value;

    const m12 = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})(?:\s?([AP])M?)?$/i.exec(raw.trim());
    const m24 = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})$/.exec(raw.trim());

    if (m12 || m24) {
      const iso = toISO(raw);
      if (iso) {
        onChange(iso);
        setText(toDisplay(iso));
        setInvalid(false);
      } else {
        setText(raw);
        setInvalid(true);
      }
      return;
    }

    const digits = raw.replace(/\D/g, '').slice(0, 12);
    if (digits.length === 12) {
      const display = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10)}`;
      finalize(display);
      return;
    }
    let formatted = digits;
    if (digits.length > 8) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setText(formatted);
    setInvalid(false);
    if (digits.length === 0) onChange('');
  };

  return (
    <div className="relative" ref={wrapRef}>
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onChange={handleTextChange}
        onClick={() => (controlOnly && onRequestOpen ? onRequestOpen() : undefined)}
        placeholder={placeholder}
        style={{ paddingRight: 28 }}
        className={`${className} ${invalid ? 'border-red-500' : ''}`}
        aria-label={placeholder}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => (onRequestOpen ? onRequestOpen() : setOpen(true))}
        aria-label="Open date and time picker"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold dark:text-white/50 dark:hover:text-gold"
      >
        <Calendar size={14} />
      </button>

      {!controlOnly && open && (
        <DateTimePanel
          value={value}
          onChange={(iso) => {
            onChange(iso);
            setText(toDisplay(iso));
            setInvalid(false);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default DateTimeInput;
export { DateTimePanel };