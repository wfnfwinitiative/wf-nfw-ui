/**
 * SectionHeader — titled group header with an icon and a count badge.
 *
 * Props:
 *   icon    — Lucide icon component
 *   label   — heading text
 *   count   — numeric badge value
 *   accent  — when true uses brand-orange colour scheme (default false)
 */
export function SectionHeader({ icon: Icon, label, count, accent = false }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${accent ? 'text-ngo-orange' : 'text-gray-400'}`} />
      <h2
        className={`text-sm font-semibold uppercase tracking-wider ${
          accent ? 'text-ngo-orange' : 'text-gray-500'
        }`}
      >
        {label}
      </h2>
      <span
        className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
          accent
            ? 'bg-ngo-orange text-white'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        {count}
      </span>
    </div>
  );
}
