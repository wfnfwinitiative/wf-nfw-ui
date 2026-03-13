const statusStyles = {
  assigned: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
  reached: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  submitted: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    dot: 'bg-purple-500',
  },
  delivered: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  inpicked: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
  verified: {
    bg: 'bg-primary-100',
    text: 'text-primary-800',
    dot: 'bg-primary-500',
  },
  completed: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
  },
  pending: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
  },
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  inactive: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
};

const statusLabels = {
  assigned: 'Assigned',
  reached: 'Reached Pickup',
  submitted: 'Details Submitted',
  delivered: 'Delivered',
  inpicked:  'In Pickup',
  rejected:  'Rejected',
  verified:  'Verified',
  completed: 'Completed',
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
};

export function StatusBadge({ status, showDot = true, className = '' }) {
  const style = statusStyles[status] || statusStyles.pending;
  const label = statusLabels[status] || status;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${style.bg} ${style.text}
        ${className}
      `}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {label}
    </span>
  );
}

export default StatusBadge;
