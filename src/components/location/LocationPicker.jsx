import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const DEBOUNCE_MS = 800;
const MIN_REQUEST_INTERVAL_MS = 1100;
const NOMINATIM_HEADERS = { Accept: 'application/json', 'User-Agent': 'NGO-Ops-LocationPicker/1.0' };
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function fixLeafletDefaultIcon() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
  });
}
fixLeafletDefaultIcon();

function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      map.setView(center, map.getZoom());
    }
  }, [map, center]);
  return null;
}

async function searchNominatim(query) {
  if (!query?.trim()) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '1'
  });
  const res = await fetch(`${NOMINATIM_SEARCH}?${params}`, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'json'
  });
  const res = await fetch(`${NOMINATIM_REVERSE}?${params}`, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return '';
  const data = await res.json();
  return data?.display_name ?? '';
}

export const LocationPicker = ({ value, onChange }) => {
  const { address: valueAddress, latitude: valueLat, longitude: valueLng } = value || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [lastSearchResult, setLastSearchResult] = useState(null);
  const lastRequestRef = useRef(0);
  const debounceRef = useRef(null);

  const hasValue = valueLat != null && valueLng != null && !Number.isNaN(valueLat) && !Number.isNaN(valueLng);
  const markerPosition = hasValue ? [Number(valueLat), Number(valueLng)] : null;
  const mapCenter = markerPosition || DEFAULT_CENTER;

  const throttleRequest = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRequestRef.current;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      return new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    lastRequestRef.current = now;
    return Promise.resolve();
  }, []);

  const notifyChange = useCallback(
    (address, latitude, longitude) => {
      onChange?.({ address: address ?? '', latitude, longitude });
    },
    [onChange]
  );

  const reverseAndNotify = useCallback(
    async (lat, lng) => {
      await throttleRequest();
      const address = await reverseGeocode(lat, lng);
      notifyChange(address, lat, lng);
    },
    [throttleRequest, notifyChange]
  );

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        await throttleRequest();
        const results = await searchNominatim(searchQuery);
        setLastSearchResult(results);
        if (results.length > 0) {
          const r = results[0];
          const lat = parseFloat(r.lat);
          const lng = parseFloat(r.lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            notifyChange(r.display_name ?? '', lat, lng);
          }
        }
      } finally {
        setSearchLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, throttleRequest, notifyChange]);

  const handleMapClick = useCallback(
    (e) => {
      const { lat, lng } = e.latlng;
      reverseAndNotify(lat, lng);
    },
    [reverseAndNotify]
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsError(null);
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          await reverseAndNotify(lat, lng);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) setGpsError('Location permission denied.');
        else if (err.code === 2) setGpsError('Location unavailable.');
        else setGpsError('Could not get your location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [reverseAndNotify]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or place name"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none text-sm"
          />
          {searchLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">Searching…</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-ngo-orange outline-none text-sm font-medium whitespace-nowrap disabled:opacity-60"
        >
          {gpsLoading ? 'Getting location…' : 'Use Current Location'}
        </button>
      </div>
      {gpsError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {gpsError}
        </p>
      )}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-56 sm:h-64">
        <MapContainer
          center={mapCenter}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom={true}
          onClick={handleMapClick}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenter center={mapCenter} />
          {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
      </div>
      {valueAddress && (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Selected address:</span> {valueAddress}
        </p>
      )}
    </div>
  );
};
