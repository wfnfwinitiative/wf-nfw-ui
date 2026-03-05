import { Loader2 } from 'lucide-react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader2
      className={`animate-spin text-primary-600 ${sizes[size]} ${className}`}
    />
  );
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export default Spinner;
