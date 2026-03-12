import { useState, useEffect } from 'react';
import { DriverAssignmentCard } from './DriverAssignmentCard';
import { PickupDetailModal } from './PickupDetailModal';
import { LoadingCard } from '../../components/common';
import { serviceApi } from '../../services/api/apiClient';
import { useAuth } from '../../auth/AuthContext';


// Maps DB status_name to the UI status string used by cards/modals.
// TODO: tighten these mappings once all DB statuses are properly assigned in production.
// NOTE: 'initiated' is temporarily overridden to 'reached' so the full pickup flow
// ("Fill Pickup Details" button → modal) can be tested before proper statuses are set.
const STATUS_NAME_MAP = {
  initiated:   'reached',   // TEMP: override to reached for testing full flow
  underreview: 'assigned',
  approved:    'assigned',
  assigned:    'assigned',
  inpickup:    'reached',
  intransit:   'submitted',
  delivered:   'delivered',
  verified:    'verified',
  closed:      'closed',
  rejected:    'rejected',
  cancelled:   'cancelled',
};

// Transforms the detailed API opportunity model (OpportunityDetailedRead) into the
// shape expected by UI components.
const normalizeOpportunity = (opp) => ({
  id: opp.opportunity_id,
  opportunityName: opp.opportunity_name,
  status_id: opp.status_id,
  status: STATUS_NAME_MAP[opp.status_name?.toLowerCase()] || 'assigned',
  status_name: opp.status_name,
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

export function DriverAssignmentsGrid() {
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
        setAssignments(data.map(normalizeOpportunity));
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

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
        <p className="text-red-500">{error}</p>
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
