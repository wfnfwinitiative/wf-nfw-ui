import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable search input. Use for filtering lists by name or identifier.
 */
export const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search by name or identifier…',
  className = '',
  id = 'search',
  ...props
}) => (
  <div className={`relative flex-1 min-w-0 ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
    <input
      id={id}
      type="search"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none text-sm md:text-base"
      aria-label="Search"
      {...props}
    />
  </div>
);

export default SearchBar;
