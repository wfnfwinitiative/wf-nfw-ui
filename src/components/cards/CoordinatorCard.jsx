import React from 'react';
import { Button } from '../../components/ui/Button';
import { Phone, Mail, Tag } from 'lucide-react';

export const CoordinatorCard = ({ coordinator, onEdit, onDelete, onActivate }) => {
  const { name, phone, email, roles, isActive } = coordinator || {};

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full">

      {/* Header strip */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm md:text-base">
            {name || 'Unnamed Coordinator'}
          </h3>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ngo-orange line-clamp-1">
            {roles?.join(', ') || 'COORDINATOR'}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap flex-shrink-0 ${
            isActive !== false
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {isActive !== false ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 divide-y divide-gray-50 dark:divide-gray-800">
        {phone && (
          <div className="flex items-start gap-2.5 py-2 first:pt-0">
            <Phone className="w-3.5 h-3.5 text-ngo-orange/70 dark:text-orange-400/70 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 leading-none mb-0.5">Phone</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono tracking-wide">{phone}</p>
            </div>
          </div>
        )}
        {email && (
          <div className="flex items-start gap-2.5 py-2 last:pb-0">
            <Mail className="w-3.5 h-3.5 text-ngo-orange/70 dark:text-orange-400/70 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 leading-none mb-0.5">Email</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 break-all">{email}</p>
            </div>
          </div>
        )}
        {roles?.length > 0 && (
          <div className="flex items-start gap-2.5 py-2 last:pb-0">
            <Tag className="w-3.5 h-3.5 text-ngo-orange/70 dark:text-orange-400/70 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 leading-none mb-0.5">Roles</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{roles.join(', ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 pb-4 pt-2 flex flex-col sm:flex-row gap-2 border-t border-gray-50 dark:border-gray-800">
        <Button variant="secondary" className="flex-1 justify-center min-h-[44px]" onClick={onEdit}>
          Edit
        </Button>
        {isActive !== false ? (
          <Button variant="primary" className="flex-1 justify-center min-h-[44px]" onClick={onDelete}>
            Deactivate
          </Button>
        ) : onActivate ? (
          <Button variant="primary" className="flex-1 justify-center min-h-[44px]" onClick={onActivate}>
            Activate
          </Button>
        ) : null}
      </div>
    </div>
  );
};

