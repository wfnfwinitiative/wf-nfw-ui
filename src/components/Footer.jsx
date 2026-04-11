import { Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 mt-auto">
      <div className="px-4 md:px-6 py-4">
        {/* Mobile: stacked, Desktop: single row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center sm:text-left">

          {/* Copyright */}
          <p className="text-xs sm:text-sm text-ngo-gray dark:text-gray-400">
            &copy; {year}{' '}
            <span className="font-semibold text-ngo-dark dark:text-gray-200">NoFoodWaste</span>.
            {' '}All rights reserved.
          </p>

          {/* Tagline */}
          <p className="flex items-center justify-center sm:justify-end gap-1 text-xs text-ngo-gray dark:text-gray-500">
            Made with{' '}
            <Heart className="w-3 h-3 text-ngo-orange fill-ngo-orange" aria-hidden />
            {' '}to fight hunger
          </p>

        </div>
      </div>
    </footer>
  );
}
