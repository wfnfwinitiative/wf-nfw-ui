export class DriverTrackingMapHelper {
    static toLatLng(obj) {
        if (!obj) return null;
        const lat = parseFloat(obj.latitude ?? obj.lat);
        const lng = parseFloat(obj.longitude ?? obj.lng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
        return { lat, lng };
    }

    static calculateBearing(prev, curr) {
        const toRad = (v) => (v * Math.PI) / 180;
        const y = Math.sin(toRad(curr.lng - prev.lng)) * Math.cos(toRad(curr.lat));
        const x =
            Math.cos(toRad(prev.lat)) * Math.sin(toRad(curr.lat)) -
            Math.sin(toRad(prev.lat)) * Math.cos(toRad(curr.lat)) * Math.cos(toRad(curr.lng - prev.lng));
        return (Math.atan2(y, x) * 180) / Math.PI;
    }

    static makePinUrl(fillColor, label) {
        const svg = [
            '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="58" viewBox="0 0 44 58">',
            '<defs><filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter></defs>',
            '<path d="M22,2 C11.5,2 3,10.5 3,21 C3,35 22,56 22,56 C22,56 41,35 41,21 C41,10.5 32.5,2 22,2Z"',
            `      fill="${fillColor}" filter="url(#sh)"/>`,
            '<circle cx="22" cy="21" r="12" fill="white" opacity="0.95"/>',
            '<text x="22" y="27" font-size="13" font-weight="bold" text-anchor="middle"',
            `      font-family="Arial,sans-serif" fill="${fillColor}">${label}</text>`,
            '</svg>',
        ].join("");
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    static makeTruckUrl(heading) {
        const svg = [
            '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">',
            `<g transform="translate(26,26) rotate(${heading})">`,
            '<ellipse cx="0" cy="2" rx="11" ry="16" fill="#00000022"/>',
            '<rect x="-9" y="-17" width="18" height="30" rx="6" fill="#1d4ed8"/>',
            '<rect x="-7" y="-17" width="14" height="11" rx="3" fill="#bfdbfe"/>',
            '<circle cx="-10" cy="-8" r="3.5" fill="#1e3a8a"/>',
            '<circle cx="10" cy="-8" r="3.5" fill="#1e3a8a"/>',
            '<circle cx="-10" cy="10" r="3.5" fill="#1e3a8a"/>',
            '<circle cx="10" cy="10" r="3.5" fill="#1e3a8a"/>',
            '<polygon points="0,-22 -5,-14 5,-14" fill="#fbbf24"/>',
            '</g></svg>',
        ].join("");
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    static async fetchDrivingRoutePath(origin, destination) {
        if (!window.google || !origin || !destination) return null;

        return new Promise((resolve) => {
            const service = new window.google.maps.DirectionsService();
            service.route(
                {
                    origin,
                    destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === "OK" && result?.routes?.[0]?.overview_path?.length) {
                        resolve(result.routes[0].overview_path);
                        return;
                    }
                    resolve(null);
                }
            );
        });
    }

    /** Haversine distance in km between two {lat,lng} points. */
    static distanceKm(a, b) {
        const R = 6371;
        const toRad = (v) => (v * Math.PI) / 180;
        const dLat = toRad(b.lat - a.lat);
        const dLng = toRad(b.lng - a.lng);
        const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(h));
    }

    static clearPolyline(polylineRef) {
        if (!polylineRef?.current) return;
        polylineRef.current.setMap(null);
        polylineRef.current = null;
    }

    static drawPolyline(map, path, options) {
        if (!map || !path || path.length < 2 || !window.google) return null;
        return new window.google.maps.Polyline({
            path,
            map,
            ...options,
        });
    }
}
