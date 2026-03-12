import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';

/**
 * Reusable filter dropdown. options: [{ value: string, label: string }]
 * value '' typically means "All".
 */
export const FilterDropdown = ({
  value = '',
  onChange,
  options = [],
  label = 'Filter',
  placeholder = 'All',
  className = '',
  id,
  ...props
}) => (
  <div className={`flex items-center gap-2 min-w-0 ${className}`}>
    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden />
    <select
      id={id}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="flex-1 min-w-0 min-h-[44px] pl-3 pr-8 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none text-sm md:text-base appearance-none bg-no-repeat bg-[length:1.25rem] bg-[right_0.5rem_center]"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
      aria-label={label}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default FilterDropdown;
