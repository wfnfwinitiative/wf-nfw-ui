/**
 * mockDriverLocation.js
 *
 * Generates a simulated driver position that walks from a start point
 * toward an end point in small steps, then reverses — giving a visible
 * moving marker on the map during local dev/QA without needing the DB.
 *
 * Used only when VITE_MOCK_TRACKING=true.
 */

const STEP_FRACTION = 0.04;   // fraction of total route covered per tick
const ACCURACY_BASE = 12;     // metres

/**
 * Returns a stateful generator function.
 * Each call to next() returns the next simulated { latitude, longitude, accuracy, updated_at }.
 *
 * @param {{ latitude: number, longitude: number }} start  – pickup coords
 * @param {{ latitude: number, longitude: number }} end    – delivery coords
 */
export function createMockLocationWalker(start, end) {
    let progress = 0;       // 0 → 1 → 0 (bounces back and forth)
    let direction = 1;

    return function next() {
        progress += STEP_FRACTION * direction;
        if (progress >= 1) { progress = 1; direction = -1; }
        if (progress <= 0) { progress = 0; direction = 1; }

        const lat = start.latitude  + (end.latitude  - start.latitude)  * progress;
        const lng = start.longitude + (end.longitude - start.longitude) * progress;

        // Add a tiny jitter so the marker visibly moves even on very short routes
        const jitter = () => (Math.random() - 0.5) * 0.0002;

        return {
            latitude:   lat + jitter(),
            longitude:  lng + jitter(),
            accuracy:   ACCURACY_BASE + Math.random() * 8,
            updated_at: new Date().toISOString(),
        };
    };
}
