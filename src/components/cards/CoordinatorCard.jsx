import React from 'react';
import { Button } from '../../components/ui/Button';

export const CoordinatorCard = ({ coordinator, onEdit, onDelete, onActivate }) => {
  const { name, phone, email, roles, isActive } = coordinator || {};

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800 p-4 md:p-5 flex flex-col justify-between h-full">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
              {name || 'Unnamed Coordinator'}
            </h3>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ngo-orange">
              {roles?.join(', ') || 'COORDINATOR'}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
            {isActive !== false ? 'Active' : 'Inactive'}
          </span>
        </div>

        {phone && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Phone:</span>{' '}
            <span className="font-mono tracking-wide">{phone}</span>
          </p>
        )}

        {email && (
          <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
            <span className="font-medium">Email:</span> {email}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Button
          variant="secondary"
          className="flex-1 justify-center"
          onClick={onEdit}
        >
          Edit
        </Button>
        {isActive !== false ? (
          <Button
            variant="danger"
            className="flex-1 justify-center"
            onClick={onDelete}
          >
            Deactivate
          </Button>
        ) : onActivate ? (
          <Button
            variant="primary"
            className="flex-1 justify-center"
            onClick={onActivate}
          >
            Activate
          </Button>
        ) : null}
      </div>
    </div>
  );
};

