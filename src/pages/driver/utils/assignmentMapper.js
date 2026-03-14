// Maps DB status_name (lowercase) → UI status token.
// Schema: 2=Assigned, 3=InPicked, 4=Rejected, 5=Delivered, 6=Verified, 7=Completed
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

/**
 * Human-readable note for each status transition, used in the timeline.
 */
export function getStatusNote(status) {
  const notes = {
    assigned:  'Opportunity assigned to driver',
    inpicked:  'Pickup details submitted',
    delivered: 'Food delivered to hunger spot',
    verified:  'Verified by coordinator',
    completed: 'Opportunity completed',
  };
  return notes[status] || '';
}

/**
 * Transforms an OpportunityDetailedRead API object into the shape
 * expected by driver UI components.
 */
export function toDriverAssignment(opp) {
  const effective = resolveEffectiveStatus(opp);
  return {
    status_id:   effective.statusId,
    status:      effective.statusUi,
    status_name: effective.statusName,
    id:              opp.opportunity_id,
    opportunityName: opp.opportunity_name,
    feeding_count:   opp.feeding_count,
    notes:           opp.notes,
    pickup: {
      organizationName: opp.donor_name,
      contactNumber:    opp.pickup_contact_no,
      scheduledTime:    opp.pickup_eta,
      location: {
        address: opp.pickup_location,
        lat:     opp.pickup_lat ?? null,
        lng:     opp.pickup_lng ?? null,
        mapLink: null,
      },
    },
    delivery: {
      hungerSpotName: opp.drop_location,
      contactNumber:  opp.drop_location_contact_no,
      location:       {
        address: opp.drop_location,
        lat:     opp.drop_lat ?? null,
        lng:     opp.drop_lng ?? null,
      },
      deliveryBy:     opp.delivery_by,
    },
    vehicle:  { number: opp.vehicle_name || `#${opp.vehicle_id}` },
    driver:   { name: opp.driver_name },
    timeline: [],
  };
}
