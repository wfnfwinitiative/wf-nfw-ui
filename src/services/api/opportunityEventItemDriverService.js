import { serviceApi } from './apiClient';

// Status IDs — 7-status schema:
// 1=Created, 2=Assigned, 3=InPicked, 4=Rejected, 5=Delivered, 6=Verified, 7=Completed
const STATUS_IDS = {
  ASSIGNED:  2,
  IN_PICKED: 3,
  DELIVERED: 5,
};

async function getEventsByOpportunity(opportunityId) {
  return await serviceApi.get(`/api/opportunity-events/by-opportunity/${opportunityId}`);
}

async function updateOpportunityEvent(eventId, payload) {
  return await serviceApi.put(`/api/opportunity-events/${eventId}`, payload);
}

/**
 * Parses a free-text quantity string like "5 kg" or "10" into
 * { quantity_value, quantity_unit }.
 */
function parseQuantity(quantityStr = '') {
  const trimmed = String(quantityStr).trim();
  const match = trimmed.match(/^([0-9]+(?:\.[0-9]+)?)\s*(.*)$/);
  if (match) {
    return {
      quantity_value: parseFloat(match[1]),
      quantity_unit: match[2].trim() || 'unit',
    };
  }
  return { quantity_value: 1, quantity_unit: 'unit' };
}

/**
 * Submits food items + status change event for a pickup confirmation.
 * @param {number} opportunityId
 * @param {Array<{foodName: string, quantity: string}>} foodItems
 * @param {number} actorId - logged-in user's ID
 * @param {number} previousStatusId - current status_id of the opportunity
 * @param {string} [notes]
 */
export async function submitPickupItems(opportunityId, foodItems, actorId, previousStatusId, notes = '') {
  const payload = {
    event_data: {
      opportunity_id: opportunityId,
      previous_status_id: previousStatusId || STATUS_IDS.ASSIGNED,
      new_status_id: STATUS_IDS.IN_PICKED,
      creator_id: actorId,
      notes: notes || null,
    },
    items_data: foodItems.map((item) => {
      const { quantity_value, quantity_unit } = parseQuantity(item.quantity);
      return {
        opportunity_id: opportunityId,
        food_name: item.foodName,
        quality: item.quality || null,
        quantity_value,
        quantity_unit,
      };
    }),
  };

  return await serviceApi.post('/api/opportunity-event-items-driver/', payload);
}

/**
 * Submits a delivery-confirmed event to update opportunity status to Delivered.
 * Uses the generic /opportunity-events/ endpoint (no items needed for delivery).
 */
export async function submitDelivery(opportunityId, actorId, previousStatusId) {
  return await serviceApi.post('/api/opportunity-events/', {
    opportunity_id: opportunityId,
    previous_status_id: previousStatusId || STATUS_IDS.IN_PICKED,
    new_status_id: STATUS_IDS.DELIVERED,
    creator_id: actorId,
  });
}

/**
 * Updates the latest event for an opportunity with new status transition.
 * Falls back to create if no event exists yet.
 */
export async function updateLatestOpportunityEventStatus(
  opportunityId,
  { previousStatusId, newStatusId, creatorId, notes = null }
) {
  const events = await getEventsByOpportunity(opportunityId);
  const latestEvent = Array.isArray(events)
    ? events.reduce((max, e) => (e.opportunity_event_id > (max?.opportunity_event_id || 0) ? e : max), null)
    : null;

  const payload = {
    opportunity_id: opportunityId,
    previous_status_id: previousStatusId,
    new_status_id: newStatusId,
    creator_id: creatorId,
    notes,
  };

  if (latestEvent?.opportunity_event_id) {
    return await updateOpportunityEvent(latestEvent.opportunity_event_id, payload);
  }

  return await serviceApi.post('/api/opportunity-events/', payload);
}
