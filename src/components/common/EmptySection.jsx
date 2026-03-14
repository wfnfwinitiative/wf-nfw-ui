/**
 * EmptySection — generic empty-state placeholder card.
 *
 * Props:
 *   message — text to display (string)
 */
export function EmptySection({ message }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
