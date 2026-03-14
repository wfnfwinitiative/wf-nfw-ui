import { useState, useEffect } from 'react';
import { DriverAssignmentCard } from './DriverAssignmentCard';
import { PickupDetailModal } from './PickupDetailModal';
import { LoadingCard } from '../../components/common';
import { serviceApi } from '../../services/api/apiClient';
import { useAuth } from '../../auth/AuthContext';
import { toDriverAssignment, getStatusNote } from './utils/assignmentMapper';
import { isToday, sortAssignments } from './utils/taskFilters';

// Computes the count summary object used by parent filter cards.
function computeCounts(list, todayOnly) {
  const base = todayOnly ? list.filter(a => isToday(a.pickup?.scheduledTime)) : list;
  return {
    all:       base.filter(a => !['completed', 'rejected'].includes(a.status)).length,
    assigned:  base.filter(a => a.status === 'assigned').length,
    inpicked:  base.filter(a => a.status === 'inpicked').length,
    delivered: base.filter(a => ['delivered', 'verified', 'completed'].includes(a.status)).length,
  };
}

export function DriverAssignmentsGrid({ statusFilter = null, todayOnly = false, onCountsChange }) {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const data = await serviceApi.get(`/api/opportunities/driver/${user.id}`);
        const normalized = data.map(toDriverAssignment);
        setAssignments(normalized);
        if (onCountsChange) onCountsChange(computeCounts(normalized, todayOnly));
      } catch (err) {
        console.error('Failed to fetch opportunities:', err);
        setError('Failed to load opportunities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [user?.id]);

  const handleStatusUpdate = (assignmentId, newStatus, additionalData = {}) => {
    setAssignments((prev) => {
      const updated = prev.map((assignment) =>
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
      );
      if (onCountsChange) onCountsChange(computeCounts(updated, todayOnly));
      return updated;
    });
    setSelectedAssignment(null);
  };

  const getStatusNote = (status) => {
    const notes = {
      assigned: 'Opportunity assigned to driver',
      inpicked: 'Pickup details submitted',
      delivered: 'Food delivered to hunger spot',
      verified: 'Verified by coordinator',
      completed: 'Opportunity completed',
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
          {todayOnly ? "No active tasks scheduled for today." : "No active assignments at the moment."}
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
