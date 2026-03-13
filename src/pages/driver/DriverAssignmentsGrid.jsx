import { useState, useEffect } from 'react';
import { DriverAssignmentCard } from './DriverAssignmentCard';
import { PickupDetailModal } from './PickupDetailModal';
import { LoadingCard } from '../../components/common';
import { serviceApi } from '../../services/api/apiClient';
import { useAuth } from '../../auth/AuthContext';


// Maps DB status_name (lowercase) → UI status token.
// Schema: 1=Created, 2=Assigned, 3=InPicked, 4=Rejected, 5=Delivered, 6=Verified, 7=Completed
// Created(1) is never shown to drivers — opportunities only appear once Assigned.
const STATUS_NAME_MAP = {
  assigned:  'assigned',
  inpicked:  'inpicked',
  rejected:  'rejected',
  delivered: 'delivered',
  verified:  'verified',
  completed: 'completed',
};

const STATUS_ID_TO_UI = {
  2: 'assigned',
  3: 'inpicked',
  4: 'rejected',
  5: 'delivered',
  6: 'verified',
  7: 'completed',
};

function resolveEffectiveStatus(opp) {
  // Prefer event-derived status to keep latest state after refresh.
  const effectiveStatusId = opp.new_status_id ?? opp.previous_status_id ?? opp.status_id;

  if (effectiveStatusId && STATUS_ID_TO_UI[effectiveStatusId]) {
    return {
      statusId: effectiveStatusId,
      statusUi: STATUS_ID_TO_UI[effectiveStatusId],
      statusName:
        (opp.new_status_id ? opp.new_status_name : opp.previous_status_name) ||
        opp.status_name ||
        null,
    };
  }

  return {
    statusId: opp.status_id,
    statusUi: STATUS_NAME_MAP[opp.status_name?.toLowerCase()] || 'assigned',
    statusName: opp.status_name || null,
  };
}

// Transforms the detailed API opportunity model (OpportunityDetailedRead) into the
// shape expected by UI components.
const toDriverAssignment = (opp) => ({
  ...(() => {
    const effective = resolveEffectiveStatus(opp);
    return {
      status_id: effective.statusId,
      status: effective.statusUi,
      status_name: effective.statusName,
    };
  })(),
  id: opp.opportunity_id,
  opportunityName: opp.opportunity_name,
  feeding_count: opp.feeding_count,
  notes: opp.notes,
  pickup: {
    organizationName: opp.donor_name,
    contactNumber: opp.pickup_contact_no,
    scheduledTime: opp.pickup_eta,
    location: { address: opp.pickup_location, mapLink: null },
  },
  delivery: {
    hungerSpotName: opp.drop_location,
    contactNumber: opp.drop_location_contact_no,
    location: { address: opp.drop_location },
    deliveryBy: opp.delivery_by,
  },
  vehicle: {
    number: opp.vehicle_name || `#${opp.vehicle_id}`,
  },
  driver: {
    name: opp.driver_name,
  },
  timeline: [],
});

export function DriverAssignmentsGrid({ statusFilter = null, onCountsChange }) {
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
        const driverId = 7
        const data = await serviceApi.get(`/api/opportunities/driver/${driverId}`);
        const normalized = data.map(toDriverAssignment);
        setAssignments(normalized);

        // Compute counts for each filter group and notify parent
        if (onCountsChange) {
          onCountsChange({
            all:      normalized.filter(a => !['completed','rejected'].includes(a.status)).length,
            assigned: normalized.filter(a => a.status === 'assigned').length,
            inpicked: normalized.filter(a => a.status === 'inpicked').length,
            delivered: normalized.filter(a => ['delivered','verified','completed'].includes(a.status)).length,
          });
        }
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
      // Recompute counts so filter cards update instantly after status change
      if (onCountsChange) {
        onCountsChange({
          all:       updated.filter(a => !['completed','rejected'].includes(a.status)).length,
          assigned:  updated.filter(a => a.status === 'assigned').length,
          inpicked:  updated.filter(a => a.status === 'inpicked').length,
          delivered: updated.filter(a => ['delivered','verified','completed'].includes(a.status)).length,
        });
      }
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

  const activeAssignments = assignments.filter((a) => {
    if (statusFilter) return statusFilter.includes(a.status);
    // By default show all active statuses; hide only fully completed/rejected
    return !['completed', 'rejected'].includes(a.status);
  });

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
