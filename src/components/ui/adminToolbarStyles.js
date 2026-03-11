/**
 * Shared Tailwind classes for Admin toolbar: Search, Filter, Sort, Add button.
 * Ensures same height, border radius, padding, font size, hover behavior.
 */
export const adminInputBase =
  'min-h-[44px] h-11 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium placeholder-gray-500 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none transition-colors';

export const adminSelectBase =
  'min-h-[44px] h-11 pl-4 pr-9 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none appearance-none bg-no-repeat bg-[length:1.25rem] bg-[right_0.5rem_center] transition-colors';

export const adminSelectBgImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`;
