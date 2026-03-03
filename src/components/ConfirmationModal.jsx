import React from 'react';
import { Button } from './ui/Button';

/**
 * Reusable confirmation dialog. Use for delete and other destructive actions.
 */
export const ConfirmationModal = ({
  open,
  title = 'Confirm',
  message = 'Are you sure you want to delete this record?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
        <h2 id="confirmation-title" className="text-lg font-bold text-ngo-dark dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-sm text-ngo-gray dark:text-gray-300 mb-6">{message}</p>
        <div className="flex flex-row items-center justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};
