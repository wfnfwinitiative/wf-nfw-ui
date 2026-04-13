import { useSendLocation } from '../../hooks/useSendLocation';

// Active statuses where the driver is on the move and should share GPS
const ACTIVE_STATUSES = new Set(['assigned', 'inpicked']);

/**
 * Invisible component — mounts one per active assignment.
 * Uses useSendLocation to push GPS to the backend while the opportunity
 * is in progress.  Renders nothing.
 */
export function DriverLocationSender({ opportunityId, status }) {
    const active = ACTIVE_STATUSES.has(status);
    useSendLocation(opportunityId, active);
    return null;
}
