import { serviceApi } from './apiClient';

/**
 * API calls for the driver live-location tracking feature.
 *
 * Driver side  → updateLocation()  called every ~15 s while opportunity is active.
 * Coordinator  → getLocation()     polled every ~10 s to refresh the map pin.
 */
export const driverLocationApi = {
    /**
     * Driver sends their current GPS position.
     * PUT /api/driver-locations/{opportunityId}
     */
    async updateLocation(opportunityId, { latitude, longitude, accuracy }) {
        return serviceApi.put(`/api/driver-locations/${opportunityId}`, {
            latitude,
            longitude,
            accuracy: accuracy ?? null,
        });
    },

    /**
     * Coordinator/admin polls for the driver's latest position.
     * GET /api/driver-locations/{opportunityId}
     */
    async getLocation(opportunityId) {
        return serviceApi.get(`/api/driver-locations/${opportunityId}`);
    },
};
