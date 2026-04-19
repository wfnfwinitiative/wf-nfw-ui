import { useState } from 'react';
import { DriverAssignmentCard } from './DriverAssignmentCard';
import { PickupDetailModal } from './PickupDetailModal';
import { LoadingCard } from '../../components/common';
import { useDriverTasksContext } from '../../contexts/DriverTasksContext';
import { useAuth } from '../../auth/AuthContext';
import { isToday, sortAssignments } from './utils/taskFilters';
import { submitRejection } from '../../services/api/opportunityEventItemDriverService';

export function DriverAssignmentsGrid({ statusFilter = null, todayOnly = false }) {
  const { user } = useAuth();
  const { assignments, loading, error, handleStatusUpdate } = useDriverTasksContext();
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const handleReject = async (assignment) => {
    try {
      await submitRejection(assignment.id, user?.id, assignment.status_id);
      handleStatusUpdate(assignment.id, 'rejected', {});
    } catch (err) {
      console.error('Failed to reject assignment:', err);
    }
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

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const activeAssignments = sortAssignments(
    assignments.filter((a) => {
      if (todayOnly && !isToday(a.pickup?.scheduledTime)) return false;
      if (statusFilter) return statusFilter.includes(a.status);
      return !['completed', 'rejected'].includes(a.status);
    })
  );

  if (activeAssignments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-500">
          {todayOnly ? 'No active tasks scheduled for today.' : 'No active assignments at the moment.'}
        </p>
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
            onReject={handleReject}
          />
        ))}
      </div>

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
