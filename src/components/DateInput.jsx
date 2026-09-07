import React, { useRef, useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const toDisplay = (iso) => {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1]}`;
};

const toISO = (display) => {
  const parts = display.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!(dd >= 1 && dd <= 31) || !(mm >= 1 && mm <= 12) || !(yyyy >= 1000 && yyyy <= 9999)) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getDate() !== dd || d.getMonth() !== mm - 1 || d.getFullYear() !== yyyy) return null;
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
};

const DateInput = ({ value, onChange, className = '', placeholder = 'DD/MM/YYYY' }) => {
  const [text, setText] = useState(toDisplay(value));
  const [invalid, setInvalid] = useState(false);
  const hiddenRef = useRef(null);

  useEffect(() => {
    setText(toDisplay(value));
  }, [value]);

  const handleTextChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setText(formatted);
    setInvalid(false);
    if (digits.length === 8) {
      const iso = toISO(formatted);
      if (iso) onChange(iso);
      else setInvalid(true);
    } else if (digits.length === 0) {
      onChange('');
    }
  };

  const openPicker = () => {
    try {
      hiddenRef.current?.showPicker?.();
    } catch {
      /* picker unavailable, fall back to manual entry */
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onChange={handleTextChange}
        placeholder={placeholder}
        style={{ paddingRight: 28 }}
        className={`${className} ${invalid ? 'border-red-500' : ''}`}
        aria-label={placeholder}
      />
      <input
        ref={hiddenRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute w-px h-px opacity-0 pointer-events-none"
        value={/^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : ''}
        onChange={(e) => {
          const iso = e.target.value;
          if (iso) {
            onChange(iso);
            setText(toDisplay(iso));
            setInvalid(false);
          }
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={openPicker}
        aria-label="Open date picker"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold dark:text-white/50 dark:hover:text-gold"
      >
        <Calendar size={14} />
      </button>
    </div>
  );
};

export default DateInput;