import { useState, useEffect, useCallback } from 'react';

/**
 * Tracks the browser's geolocation permission state and provides a
 * requestPermission() function that triggers the native browser prompt.
 *
 * Returns:
 *   status:
 *     'checking'    — querying the Permissions API, UI should show spinner
 *     'granted'     — driver has already allowed location
 *     'prompt'      — browser hasn't asked yet, need to trigger prompt
 *     'denied'      — driver explicitly blocked location
 *     'unsupported' — device/browser has no geolocation at all
 *
 *   requestPermission(): Promise
 *     Triggers the native browser location prompt. Resolves with the
 *     GeolocationPosition on success, rejects with a GeolocationPositionError
 *     on denial or timeout.
 */
export function useLocationPermission() {
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('unsupported');
            return;
        }

        // Permissions API gives us current state without triggering a prompt
        if (navigator.permissions) {
            navigator.permissions
                .query({ name: 'geolocation' })
                .then((result) => {
                    setStatus(result.state); // 'granted' | 'prompt' | 'denied'
                    // React live to future changes (e.g. driver changes browser setting mid-session)
                    result.onchange = () => setStatus(result.state);
                })
                .catch(() => {
                    // Permissions API not available (rare) — assume not asked yet
                    setStatus('prompt');
                });
        } else {
            // Firefox < 46 etc. — fall back to assuming prompt
            setStatus('prompt');
        }
    }, []);

    /**
     * Triggers the browser's native "Allow location?" dialog.
     * Should only be called in direct response to a user gesture (button click).
     */
    const requestPermission = useCallback(() => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setStatus('granted');
                    resolve(position);
                },
                (err) => {
                    if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
                        setStatus('denied');
                    }
                    reject(err);
                },
                { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
            );
        });
    }, []);

    return { status, requestPermission };
}
