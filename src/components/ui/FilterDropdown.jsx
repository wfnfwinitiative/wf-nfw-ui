import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Check } from 'lucide-react';

/**
 * Admin toolbar filter — custom dropdown so it never overflows on mobile.
 * options: [{ value: string, label: string }]
 */
export const FilterDropdown = ({
  value = '',
  onChange,
  options = [],
  label = 'Filter',
  placeholder = 'All',
  className = '',
  id,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected ? selected.label : placeholder;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (val) => {
    onChange?.(val);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={`relative flex items-center gap-2 min-w-0 w-full sm:w-auto sm:min-w-[140px] ${className}`}
    >
      <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden />
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex-1 min-w-0 flex items-center justify-between gap-2 min-h-[44px] h-11 pl-4 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none transition-colors"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              onClick={() => handleSelect('')}
              className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                value === '' ? 'text-ngo-orange font-semibold' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {placeholder}
              {value === '' && <Check className="w-4 h-4 flex-shrink-0" />}
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  value === opt.value ? 'text-ngo-orange font-semibold' : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown;
