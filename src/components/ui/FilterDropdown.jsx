import React from 'react';
import { Filter } from 'lucide-react';
import { adminSelectBase, adminSelectBgImage } from './adminToolbarStyles';

/**
 * Admin toolbar filter. options: [{ value: string, label: string }].
 * Same height/styling as Search, Sort, Add button.
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
  <div className={`flex items-center gap-2 min-w-0 w-full sm:w-auto sm:min-w-[140px] ${className}`}>
    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden />
    <select
      id={id}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`flex-1 min-w-0 ${adminSelectBase}`}
      style={{ backgroundImage: adminSelectBgImage }}
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
