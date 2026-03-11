import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

/**
 * Client-side pagination controls.
 * totalItems: number of items; currentPage: 1-based; onPageChange: (page: number) => void
 */
export const Pagination = ({
  totalItems,
  currentPage,
  onPageChange,
  itemsPerPage = ITEMS_PER_PAGE,
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const page = Math.max(1, Math.min(currentPage, totalPages));
  const start = (page - 1) * itemsPerPage + 1;
  const end = Math.min(page * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {totalItems === 0 ? 0 : start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-ngo-orange outline-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-ngo-orange outline-none"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export { ITEMS_PER_PAGE };
export default Pagination;
