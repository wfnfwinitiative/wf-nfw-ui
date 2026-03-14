import React, { useState, useMemo } from 'react';
import { Clock2 } from 'lucide-react';
import { DashedSeparator, EmptySection } from '../../../components/common';
import { FilterDropdown } from '../../../components/ui';
import { TaskGrid } from './TaskGrid';
import { applyDateRange, DATE_RANGE_OPTIONS } from '../utils/taskFilters';

// Strip the 'all' sentinel — FilterDropdown's empty placeholder covers it
const DATE_FILTER_OPTIONS = DATE_RANGE_OPTIONS.filter((o) => o.value !== 'all');

const inputClass =
  'min-h-[36px] h-9 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none transition-colors';

/**
 * Section that lists past assignments with an optional date-range filter.
 * Uses FilterDropdown (custom panel) so the list never overflows on mobile.
 */
export function PreviousSection({ tasks, onSelect }) {
  // '' maps to 'all' in applyDateRange (falls through to return tasks)
  const [dateRange,  setDateRange]  = useState('');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');

  const filtered = useMemo(
    () => applyDateRange(tasks, dateRange || 'all', customFrom, customTo),
    [tasks, dateRange, customFrom, customTo],
  );

  return (
    <>
      <DashedSeparator label="Previous" />
      <section>
        {/* Header — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
          {/* Label + count */}
          <div className="flex items-center gap-2 min-w-0">
            <Clock2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Earlier Assignments
            </span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              {filtered.length}
            </span>
          </div>

          {/* Date range filter */}
          <div className="flex flex-col gap-2 sm:ml-auto sm:items-end">
            <FilterDropdown
              value={dateRange}
              onChange={setDateRange}
              options={DATE_FILTER_OPTIONS}
              placeholder="All Previous"
              label="Filter by date range"
              className="w-full sm:w-auto sm:min-w-[160px]"
            />
            {dateRange === 'custom' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className={`w-full sm:w-auto ${inputClass}`}
                  aria-label="From date"
                />
                <span className="text-xs text-gray-400 hidden sm:inline">to</span>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className={`w-full sm:w-auto ${inputClass}`}
                  aria-label="To date"
                />
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0
          ? <EmptySection message="No previous assignments found for the selected range." />
          : <TaskGrid tasks={filtered} onSelect={onSelect} />
        }
      </section>
    </>
  );
}
