import { serviceApi } from './apiClient';

// Status IDs — 7-status schema:
// 1=Created, 2=Assigned, 3=InPicked, 4=Rejected, 5=Delivered, 6=Verified, 7=Completed
const STATUS_IDS = {
  ASSIGNED:  2,
  IN_PICKED: 3,
  REJECTED:  4,
  DELIVERED: 5,
};

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
    };
  }
  return { quantity_value: 1};
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
      const { quantity_value } = parseQuantity(item.quantity);
      return {
        opportunity_id: opportunityId,
        food_name: item.foodName,
        quality: item.quality || null,
        quantity_value,
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
 * Submits a rejection event — driver cannot pick up the assigned opportunity.
 * @param {number} opportunityId
 * @param {number} actorId - logged-in driver's user ID
 * @param {number} previousStatusId - should be STATUS_IDS.ASSIGNED (2)
 * @param {string} [reason] - optional rejection reason
 */
export async function submitRejection(opportunityId, actorId, previousStatusId, reason = '') {
  return await serviceApi.post('/api/opportunity-events/', {
    opportunity_id: opportunityId,
    previous_status_id: previousStatusId || STATUS_IDS.ASSIGNED,
    new_status_id: STATUS_IDS.REJECTED,
    creator_id: actorId,
    notes: reason || null,
  });
}
