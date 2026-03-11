import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

const DEBOUNCE_MS = 400;

/**
 * Admin toolbar search. Filters cards by name/identifier.
 * Debounces onChange by ~400ms. Styling matches Add button: same height, radius, padding, font, shadow.
 */
const searchInputClasses =
  'w-full pl-10 pr-4 md:pr-6 min-h-[44px] h-10 md:h-11 rounded-xl font-semibold text-sm md:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 shadow-md hover:shadow-lg focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none transition-all';

export const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search by name or identifier…',
  className = '',
  id = 'search',
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange?.(localValue);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localValue]);

  return (
    <div className={`relative flex-1 min-w-0 ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        id={id}
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={searchInputClasses}
        aria-label="Search"
        {...props}
      />
    </div>
  );
};

export default SearchBar;
