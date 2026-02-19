import { useState } from 'react';
import { mockAssignments } from '../../services/mockData';
import { DriverAssignmentCard } from './DriverAssignmentCard';
import { PickupDetailModal } from './PickupDetailModal';
import { LoadingCard } from '../common';

export function DriverAssignmentsGrid() {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignments, setAssignments] = useState(mockAssignments);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = (assignmentId, newStatus, additionalData = {}) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              status: newStatus,
              ...additionalData,
              timeline: [
                ...assignment.timeline,
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  note: getStatusNote(newStatus),
                },
              ],
            }
          : assignment
      )
    );
    setSelectedAssignment(null);
  };

  const getStatusNote = (status) => {
    const notes = {
      reached: 'Driver reached pickup location',
      submitted: 'Pickup details submitted',
      delivered: 'Food delivered to hunger spot',
      verified: 'Verified by coordinator',
    };
    return notes[status] || '';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  const activeAssignments = assignments.filter(
    (a) => !['verified'].includes(a.status)
  );

  if (activeAssignments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-500">No active assignments at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeAssignments.map((assignment) => (
          <DriverAssignmentCard
            key={assignment.id}
            assignment={assignment}
            onClick={() => setSelectedAssignment(assignment)}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>

      {/* Pickup Detail Modal */}
      <PickupDetailModal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        assignment={selectedAssignment}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}

export default DriverAssignmentsGrid;
