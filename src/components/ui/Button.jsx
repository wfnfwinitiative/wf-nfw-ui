import React from 'react';

const variantClasses = {
  primary:
    'bg-ngo-orange text-white hover:bg-orange-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-white text-ngo-dark border border-gray-300 hover:bg-ngo-light shadow-sm transition-all disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
};

/**
 * Design-system button. No inline button colors elsewhere.
 * Responsive: h-10 md:h-11, text-sm md:text-base, px-4 md:px-6.
 */
export const Button = ({
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold h-10 md:h-11 text-sm md:text-base px-4 md:px-6 min-h-[44px] touch-manipulation';
  const width = fullWidth ? 'w-full' : '';
  const combined = `${base} ${width} ${variantClasses[variant]} ${className}`.trim();

  return (
    <button type={type} disabled={disabled} className={combined} {...props}>
      {children}
    </button>
  );
};
