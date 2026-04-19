import React from 'react';
import { Button } from '../ui/Button';
import {
  Phone, Mail, MapPin, Building2, FileText,
  Tag, Navigation2, User, Info, Hash,
} from 'lucide-react';

const ICON_MAP = [
  { test: l => l.includes('phone') || l.includes('mobile') || l.includes('contact number'), icon: Phone },
  { test: l => l.includes('email'),                                                          icon: Mail },
  { test: l => l.includes('address'),                                                        icon: MapPin },
  { test: l => l.includes('city'),                                                           icon: Building2 },
  { test: l => l.includes('capacity') || l.includes('notes'),                               icon: FileText },
  { test: l => l.includes('type'),                                                           icon: Tag },
  { test: l => l.includes('coord'),                                                          icon: Navigation2 },
  { test: l => l.includes('contact name') || l.includes('contact person'),                  icon: User },
  { test: l => l.includes('vehicle') || l.includes('number'),                               icon: Hash },
];

function FieldIcon({ label }) {
  if (!label) return <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />;
  const l = label.toLowerCase();
  const match = ICON_MAP.find(m => m.test(l));
  const Icon = match ? match.icon : Info;
  return <Icon className="w-3.5 h-3.5 text-ngo-orange/70 dark:text-orange-400/70 shrink-0 mt-0.5" />;
}

/**
 * Reusable tile card for admin/coordinator list views.
 * Props: title, subtitle, status, fields[{label,value,mono?}], onEdit, onDelete, onActivate, deleteLabel, children
 */
export const TileCard = ({
  title,
  subtitle,
  status,
  fields = [],
  onEdit,
  onDelete,
  onActivate,
  deleteLabel = 'Delete',
  children,
  className = '',
}) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full ${className}`}
  >
    {/* Header strip */}
    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm md:text-base">
          {title || '—'}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ngo-orange line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>
      {status != null && status !== '' && (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap flex-shrink-0 ${
            status === 'active' || status === 'Active'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {String(status)}
        </span>
      )}
    </div>

    {/* Body */}
    <div className="p-4 flex-1 space-y-0 divide-y divide-gray-50 dark:divide-gray-800">
      {children}
      {!children &&
        fields.map((f, i) => (
          <div key={i} className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
            <FieldIcon label={f.label} />
            <div className="min-w-0 flex-1">
              {f.label && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 leading-none mb-0.5">
                  {f.label}
                </p>
              )}
              <p className={`text-sm text-gray-700 dark:text-gray-300 break-words leading-snug ${f.mono ? 'font-mono tracking-wide' : ''}`}>
                {f.value ?? '—'}
              </p>
            </div>
          </div>
        ))}
    </div>

    {/* Footer actions */}
    {(onEdit || onDelete || onActivate) && (
      <div className="px-4 pb-4 pt-2 flex flex-col sm:flex-row gap-2 border-t border-gray-50 dark:border-gray-800">
        {onEdit && (
          <Button variant="secondary" className="flex-1 justify-center min-h-[44px]" onClick={onEdit}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="primary" className="flex-1 justify-center min-h-[44px]" onClick={onDelete}>
            {deleteLabel}
          </Button>
        )}
        {onActivate && (
          <Button variant="primary" className="flex-1 justify-center min-h-[44px]" onClick={onActivate}>
            Activate
          </Button>
        )}
      </div>
    )}
  </div>
);

export default TileCard;

