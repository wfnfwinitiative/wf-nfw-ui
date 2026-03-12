import React from 'react';
import { Button } from '../ui/Button';

/**
 * Reusable tile card for admin list views.
 * title: main heading; subtitle: optional badge/label; fields: array of { label, value }; onEdit, onDelete: handlers
 */
export const TileCard = ({
  title,
  subtitle,
  status,
  fields = [],
  onEdit,
  onDelete,
  children,
  className = ''
}) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-800 p-4 md:p-5 flex flex-col justify-between h-full ${className}`}
  >
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
            {title || '—'}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ngo-orange">
              {subtitle}
            </p>
          )}
        </div>
        {status != null && status !== '' && (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${
              status === 'active' || status === 'Active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {String(status)}
          </span>
        )}
      </div>

      {children}

      {fields.length > 0 && !children && (
        <div className="space-y-1">
          {fields.map((f, i) => (
            <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
              {f.label && <span className="font-medium">{f.label}: </span>}
              <span className={f.mono ? 'font-mono tracking-wide' : ''}>{f.value ?? '—'}</span>
            </p>
          ))}
        </div>
      )}
    </div>

    {(onEdit || onDelete) && (
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        {onEdit && (
          <Button variant="secondary" className="flex-1 justify-center min-h-[44px]" onClick={onEdit}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="danger" className="flex-1 justify-center min-h-[44px]" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    )}
  </div>
);

export default TileCard;
