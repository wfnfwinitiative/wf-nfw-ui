import React from 'react';
import { DriverAssignmentCard } from '../DriverAssignmentCard';

/**
 * Responsive grid of DriverAssignmentCard items.
 * `disableCards` prevents click / fill-details on future assignments.
 */
export function TaskGrid({ tasks, onSelect, disableCards = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {tasks.map((a) => (
        <DriverAssignmentCard
          key={a.id}
          assignment={a}
          onClick={() => onSelect(a)}
          disabled={disableCards}
        />
      ))}
    </div>
  );
}
