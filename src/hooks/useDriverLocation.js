import { useState, useEffect, useRef, useCallback } from 'react';
import { driverLocationApi } from '../services/api/driverLocationService';
import { createMockLocationWalker } from '../utils/mockDriverLocation';

const POLL_INTERVAL_MS  = 10_000;  // real polling — every 10 s
const MOCK_INTERVAL_MS  = 3_000;   // mock ticks faster so movement is visible
const MAX_RETRIES       = 3;
const RETRY_DELAY_MS    = 2_000;

const MOCK_ENABLED = import.meta.env.VITE_MOCK_TRACKING === 'true';

/**
 * Coordinator hook — polls the backend for the driver's latest GPS position.
 *
 * When VITE_MOCK_TRACKING=true (local dev / QA) it simulates a moving driver
 * between the supplied pickupCoords and deliveryCoords so the map can be
 * tested without the DB table being created yet.
 *
 * @param {number|string} opportunityId
 * @param {boolean} enabled            – only poll when the opportunity is active
 * @param {object|null} pickupCoords   – { latitude, longitude } — used by mock only
 * @param {object|null} deliveryCoords – { latitude, longitude } — used by mock only
 * @returns {{ location, loading, error, isMock }}
 */
export function useDriverLocation(opportunityId, enabled = true, pickupCoords = null, deliveryCoords = null) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [effectivePickup, setEffectivePickup]     = useState(null);
    const [effectiveDelivery, setEffectiveDelivery] = useState(null);
    const intervalRef = useRef(null);
    const retriesRef  = useRef(0);
    const walkerRef   = useRef(null);   // mock only

    // ── MOCK MODE ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!MOCK_ENABLED || !enabled || !opportunityId) return;

        // Build start/end from provided coords, or use hardcoded Hyderabad defaults
        const start = pickupCoords  ?? { latitude: 17.3850, longitude: 78.4867 };
        const end   = deliveryCoords ?? { latitude: 17.4126, longitude: 78.4071 };

        // Expose the actual route endpoints so the map can show pickup/delivery pins
        setEffectivePickup(start);
        setEffectiveDelivery(end);

        walkerRef.current = createMockLocationWalker(start, end);

        // Emit first position immediately
        setLocation(walkerRef.current());
        setLoading(false);

        intervalRef.current = setInterval(() => {
            setLocation(walkerRef.current());
        }, MOCK_INTERVAL_MS);

        return () => clearInterval(intervalRef.current);
    }, [MOCK_ENABLED, enabled, opportunityId, pickupCoords?.latitude, deliveryCoords?.latitude]);

    // ── REAL API MODE ──────────────────────────────────────────────────────
    const fetchWithRetry = useCallback(async () => {
        if (MOCK_ENABLED || !opportunityId || !enabled) return;

        try {
            const data = await driverLocationApi.getLocation(opportunityId);
            setLocation(data);
            setError(null);
            retriesRef.current = 0;
        } catch (err) {
            if (err?.response?.status === 404) {
                setError(null);
                return;
            }
            retriesRef.current += 1;
            if (retriesRef.current >= MAX_RETRIES) {
                setError('Unable to fetch driver location. Retrying…');
            }
            setTimeout(fetchWithRetry, RETRY_DELAY_MS * retriesRef.current);
        }
    }, [opportunityId, enabled]);

    useEffect(() => {
        if (MOCK_ENABLED || !enabled || !opportunityId) return;

        setLoading(true);
        fetchWithRetry().finally(() => setLoading(false));

        intervalRef.current = setInterval(fetchWithRetry, POLL_INTERVAL_MS);

        return () => clearInterval(intervalRef.current);
    }, [opportunityId, enabled, fetchWithRetry]);

    return { location, loading, error, isMock: MOCK_ENABLED, effectivePickup, effectiveDelivery };
}
