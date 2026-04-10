import { useEffect, useRef, useCallback } from 'react';
import { driverLocationApi } from '../services/api/driverLocationService';

const SEND_INTERVAL_MS = 15_000;   // send every 15 s
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3_000;

/**
 * Driver hook — watches the device GPS and pushes updates to the backend
 * while the opportunity is active.
 *
 * @param {number|string} opportunityId
 * @param {boolean} active  - start/stop tracking based on opportunity status
 */
export function useSendLocation(opportunityId, active = false) {
    const watchIdRef = useRef(null);
    const intervalRef = useRef(null);
    const latestPositionRef = useRef(null);
    const retriesRef = useRef(0);

    const sendPosition = useCallback(async () => {
        const pos = latestPositionRef.current;
        if (!pos || !opportunityId) return;

        try {
            await driverLocationApi.updateLocation(opportunityId, {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
            });
            retriesRef.current = 0;
        } catch {
            retriesRef.current += 1;
            if (retriesRef.current < MAX_RETRIES) {
                setTimeout(sendPosition, RETRY_DELAY_MS * retriesRef.current);
            }
            // Silently stop retrying after MAX_RETRIES — network may be unstable
        }
    }, [opportunityId]);

    useEffect(() => {
        if (!active || !opportunityId) return;

        if (!navigator.geolocation) {
            console.warn('[useSendLocation] Geolocation not supported on this device.');
            return;
        }

        // Keep latest position in ref
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => { latestPositionRef.current = position; },
            (err) => { console.warn('[useSendLocation] GPS error:', err.message); },
            { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 }
        );

        // Send on interval
        intervalRef.current = setInterval(sendPosition, SEND_INTERVAL_MS);
        // Send immediately on first activation
        sendPosition();

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            clearInterval(intervalRef.current);
        };
    }, [active, opportunityId, sendPosition]);
}
