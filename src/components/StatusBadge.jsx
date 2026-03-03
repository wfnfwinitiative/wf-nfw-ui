import React from 'react';

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    CREATED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Created' },
    ASSIGNED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Assigned' },
    ACCEPTED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Accepted' },
    PICKUP_DONE: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pickup Done' },
    DELIVERED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Delivered' },
    PENDING_VERIFICATION: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Verification' },
    VERIFIED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Verified' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
  };

  const config = statusConfig[status] || statusConfig.CREATED;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};
