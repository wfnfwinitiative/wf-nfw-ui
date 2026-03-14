/**
 * A full-width dashed rule with an optional centred label.
 * Used to visually separate task sections (Upcoming, Previous, etc.)
 */
export function DashedSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700" />
      {label && (
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest px-2">
          {label}
        </span>
      )}
      <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700" />
    </div>
  );
}
