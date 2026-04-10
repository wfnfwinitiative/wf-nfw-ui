import { useState } from 'react';
import { MapPin, AlertTriangle, Loader2, Navigation } from 'lucide-react';
import { useLocationPermission } from '../../hooks/useLocationPermission';

/**
 * Wraps driver pages that need location.
 *
 * - 'checking'    → spinner
 * - 'granted'     → renders children normally
 * - 'prompt'      → blocking screen asking the driver to share location
 * - 'denied'      → blocking screen explaining how to re-enable in browser
 * - 'unsupported' → blocking screen advising to use a different browser/device
 */
export function LocationPermissionGate({ children }) {
    const { status, requestPermission } = useLocationPermission();
    const [requesting, setRequesting] = useState(false);
    const [requestError, setRequestError] = useState(null);

    const handleAllow = async () => {
        setRequesting(true);
        setRequestError(null);
        try {
            await requestPermission();
            // status updates reactively via the hook — no manual state change needed
        } catch {
            setRequestError('Location access was not granted. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    if (status === 'checking') {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Checking location access…</p>
            </div>
        );
    }

    if (status === 'granted') {
        return children;
    }

    if (status === 'unsupported') {
        return (
            <PermissionScreen
                icon={<AlertTriangle className="w-10 h-10 text-yellow-500" />}
                title="GPS Not Available"
                message="Your device or browser does not support GPS location. Please use a modern mobile browser (Chrome or Safari) to access driver tasks."
                bg="bg-yellow-50"
                border="border-yellow-200"
            />
        );
    }

    if (status === 'denied') {
        return (
            <PermissionScreen
                icon={<MapPin className="w-10 h-10 text-red-500" />}
                title="Location Access Blocked"
                message="You have blocked location access. Driver tasks require live GPS to track pickups and deliveries."
                bg="bg-red-50"
                border="border-red-200"
            >
                <div className="mt-5 p-4 bg-white border border-red-100 rounded-xl text-left text-sm text-gray-700 space-y-2">
                    <p className="font-semibold text-gray-900">How to re-enable:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                        <li>Tap the <strong>lock icon</strong> or <strong>info icon</strong> in your browser's address bar</li>
                        <li>Find <strong>Location</strong> and set it to <strong>Allow</strong></li>
                        <li>Reload this page</li>
                    </ol>
                </div>
            </PermissionScreen>
        );
    }

    // status === 'prompt' — driver hasn't been asked yet
    return (
        <PermissionScreen
            icon={<Navigation className="w-10 h-10 text-ngo-orange" />}
            title="Location Access Required"
            message="Your live location is required to track pickups and deliveries. The coordinator uses this to monitor progress in real time."
            bg="bg-orange-50"
            border="border-orange-200"
        >
            {requestError && (
                <p className="mt-3 text-sm text-red-600 font-medium">{requestError}</p>
            )}
            <button
                onClick={handleAllow}
                disabled={requesting}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-ngo-orange text-white
                  rounded-xl font-semibold hover:bg-orange-600 transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {requesting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <MapPin className="w-4 h-4" />}
                {requesting ? 'Requesting…' : 'Allow Location Access'}
            </button>
            <p className="mt-3 text-xs text-gray-500">
                Your location is only shared while you have an active assignment.
            </p>
        </PermissionScreen>
    );
}

// ─── Internal layout helper ──────────────────────────────────────────────────
function PermissionScreen({ icon, title, message, bg, border, children }) {
    return (
        <div className={`mx-auto max-w-sm mt-10 rounded-2xl border ${border} ${bg} p-8 text-center`}>
            <div className="flex justify-center mb-4">{icon}</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
            {children}
        </div>
    );
}
