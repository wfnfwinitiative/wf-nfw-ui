import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { adminSelectBase, adminSelectBgImage } from './adminToolbarStyles';

export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  RECENT: 'recent',
  OLDEST: 'oldest'
};

const DEFAULT_OPTIONS = [
  { value: SORT_OPTIONS.NAME_ASC, label: 'Name A–Z' },
  { value: SORT_OPTIONS.NAME_DESC, label: 'Name Z–A' },
  { value: SORT_OPTIONS.RECENT, label: 'Recently Added' },
  { value: SORT_OPTIONS.OLDEST, label: 'Oldest' }
];

/**
 * Admin toolbar sort. Reorders cards.
 * Same height/styling as Search, Filter, Add button.
 */
export const SortDropdown = ({
  value = '',
  onChange,
  options = DEFAULT_OPTIONS,
  label = 'Sort by',
  placeholder = 'Sort by',
  className = '',
  id,
  ...props
}) => (
  <div className={`flex items-center gap-2 min-w-0 w-full sm:w-auto sm:min-w-[160px] ${className}`}>
    <ArrowUpDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden />
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

export default SortDropdown;
