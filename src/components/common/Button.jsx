import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-ngo-orange hover:bg-orange-600 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  outline: 'border-2 border-ngo-orange text-ngo-orange hover:bg-orange-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-lg 
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-ngo-orange focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
}

export default Button;
