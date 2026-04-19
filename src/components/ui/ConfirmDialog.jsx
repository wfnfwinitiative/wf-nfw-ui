import { Button } from './Button';

/**
 * Simple confirmation dialog (portal-less, fixed overlay).
 *
 * Props:
 *  isOpen      – boolean
 *  title       – string
 *  message     – string
 *  confirmLabel – string (default "Confirm")
 *  cancelLabel  – string (default "Cancel")
 *  confirmVariant – Button variant for confirm btn (default "danger")
 *  loading     – boolean
 *  onConfirm   – () => void
 *  onCancel    – () => void
 */
export function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-lg font-bold text-ngo-dark">{title}</h3>
          {message && <p className="text-sm text-ngo-gray mt-1">{message}</p>}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
