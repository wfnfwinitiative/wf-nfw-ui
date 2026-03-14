/**
 * Builds a navigation URL that opens Google Maps on Android (native app),
 * falls back to Google Maps in the browser on iOS/desktop — completely free,
 * no API key required.
 *
 * @param {object} location - { lat, lng, address }
 * @returns {string|null}
 */
export function buildNavUrl(location) {
  if (location?.lat && location?.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`;
  }
  if (location?.address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}&travelmode=driving`;
  }
  return null;
}

/**
 * Opens navigation using the device's current GPS position as the origin.
 * Falls back to destination-only if geolocation is denied or unavailable.
 *
 * @param {object} location - { lat, lng, address }
 */
export function navigateTo(location) {
  const dest =
    location?.lat && location?.lng
      ? `${location.lat},${location.lng}`
      : location?.address
      ? encodeURIComponent(location.address)
      : null;

  if (!dest) return;

  if (!navigator.geolocation) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
      '_blank',
      'noopener,noreferrer'
    );
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`,
        '_blank',
        'noopener,noreferrer'
      );
    },
    () => {
      // Permission denied or unavailable — open without origin
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
        '_blank',
        'noopener,noreferrer'
      );
    },
    { timeout: 5000 }
  );
}
