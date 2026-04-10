import React, { useRef, useEffect, useState } from "react";
import {
    GoogleMap,
    useLoadScript,
    MarkerF,
    InfoWindowF,
} from "@react-google-maps/api";
import { AlertCircle } from "lucide-react";
import { Spinner } from "./Spinner";
import { DriverTrackingMapHelper } from "../../utils/maps/DriverTrackingMapHelper";

const LIBRARIES = ["places"];
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };
const IS_MOCK_TRACKING = import.meta.env.VITE_MOCK_TRACKING === "true";

//  Small sub-components 
function MapLoadError() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500 bg-red-50 rounded-xl p-6">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium">Failed to load Google Maps</p>
        </div>
    );
}
function MapLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3 bg-gray-50 rounded-xl">
            <Spinner size="md" />
            <p className="text-sm text-gray-500">Loading map...</p>
        </div>
    );
}
function WaitingBanner({ driverName }) {
    return (
        <div className="absolute inset-x-0 top-3 mx-4 z-10 pointer-events-none">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 flex items-center gap-2 text-yellow-800 text-sm shadow">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                Waiting for <strong className="ml-0.5">{driverName}</strong> to share location...
            </div>
        </div>
    );
}
function LiveBadge({ updatedAt, driverName }) {
    const t = updatedAt
        ? new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : null;
    return (
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1">
            <div className="bg-white/90 backdrop-blur rounded-xl shadow px-3 py-1.5 flex items-center gap-2 text-sm font-medium text-gray-800 border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                {driverName}
            </div>
            {t && (
                <div className="bg-white/80 backdrop-blur rounded-lg shadow px-2 py-0.5 text-[11px] text-gray-500 border border-gray-100 self-start">
                    Updated {t}
                </div>
            )}
        </div>
    );
}

//  Main exported component 
export function DriverTrackingMap({
    driverLocation,
    pickupLocation,
    deliveryLocation,
    traveledPath = [],      // [{lat, lng}, ...] accumulated GPS trail from coordinator
    driverName = "Driver",
    height = "450px",
}) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries: LIBRARIES,
    });

    const [activeInfo, setActiveInfo] = useState(null);
    const [hdg, setHdg]               = useState(0);
    const [fullRoutePath, setFullRoutePath] = useState(null);

    const mapRef     = useRef(null);
    const prevRef    = useRef(null);
    const fittedRef  = useRef(false);
    const fullLineRef = useRef(null);
    const doneLineRef = useRef(null);
    // store initial center so <GoogleMap center> prop never changes (stops re-renders)
    const initCenter = useRef(null);

    const driverPos   = DriverTrackingMapHelper.toLatLng(driverLocation);
    const pickupPos   = DriverTrackingMapHelper.toLatLng(pickupLocation);
    const deliveryPos = DriverTrackingMapHelper.toLatLng(deliveryLocation);

    // Set initial center once
    if (!initCenter.current) {
        initCenter.current = driverPos || pickupPos || deliveryPos || DEFAULT_CENTER;
    }

    // Rotate truck icon
    useEffect(() => {
        if (!driverPos) return;
        if (prevRef.current) {
            setHdg(DriverTrackingMapHelper.calculateBearing(prevRef.current, driverPos));
        }
        prevRef.current = driverPos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driverPos?.lat, driverPos?.lng]);

    // Auto-fit once after both pickup + drop are available (driver optional)
    useEffect(() => {
        if (!mapRef.current || !isLoaded || fittedRef.current) return;
        if (!pickupPos || !deliveryPos) return;
        const pts = [pickupPos, deliveryPos, driverPos].filter(Boolean);
        const bounds = new window.google.maps.LatLngBounds();
        pts.forEach((p) => bounds.extend(p));
        mapRef.current.fitBounds(bounds, 80);
        fittedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, !!driverPos, !!pickupPos, !!deliveryPos]);

    // Fetch full road route (pickup -> drop)
    useEffect(() => {
        let isCancelled = false;

        async function loadFullRoute() {
            if (!isLoaded || !pickupPos || !deliveryPos) {
                setFullRoutePath(null);
                return;
            }

            const path = await DriverTrackingMapHelper.fetchDrivingRoutePath(pickupPos, deliveryPos);
            if (!isCancelled) setFullRoutePath(path);
        }

        loadFullRoute();
        return () => {
            isCancelled = true;
        };
    }, [isLoaded, pickupPos?.lat, pickupPos?.lng, deliveryPos?.lat, deliveryPos?.lng]);



    // Draw/refresh route lines directly on Google map (reliable rendering)
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return;

        // Blue line — planned road route pickup→drop (straight line fallback if Directions API unavailable)
        const fullPathToRender = fullRoutePath || (pickupPos && deliveryPos ? [pickupPos, deliveryPos] : null);
        // Orange line — actual GPS trail the driver has traveled (accumulated coordinate history)
        const donePathToRender = traveledPath.length >= 2 ? traveledPath : null;

        DriverTrackingMapHelper.clearPolyline(fullLineRef);
        if (fullPathToRender) {
            fullLineRef.current = DriverTrackingMapHelper.drawPolyline(mapRef.current, fullPathToRender, {
                geodesic: true,
                strokeColor: "#1d4ed8",
                strokeOpacity: 0.6,
                strokeWeight: 6,
                zIndex: 900,
            });
        }

        DriverTrackingMapHelper.clearPolyline(doneLineRef);
        if (donePathToRender) {
            doneLineRef.current = DriverTrackingMapHelper.drawPolyline(mapRef.current, donePathToRender, {
                geodesic: true,
                strokeColor: "#f97316",
                strokeOpacity: 1,
                strokeWeight: 5,
                zIndex: 950,
            });
        }

        return () => {
            DriverTrackingMapHelper.clearPolyline(fullLineRef);
            DriverTrackingMapHelper.clearPolyline(doneLineRef);
        };
    }, [
        isLoaded,
        pickupPos?.lat,
        pickupPos?.lng,
        deliveryPos?.lat,
        deliveryPos?.lng,
        driverPos?.lat,
        driverPos?.lng,
        fullRoutePath,
        traveledPath,
    ]);

    if (loadError) return <div style={{ height }}><MapLoadError /></div>;
    if (!isLoaded) return <div style={{ height }}><MapLoading /></div>;

    const truckIcon   = { url: DriverTrackingMapHelper.makeTruckUrl(hdg),      scaledSize: new window.google.maps.Size(52, 52), anchor: new window.google.maps.Point(26, 26) };
    const pickupIcon  = { url: DriverTrackingMapHelper.makePinUrl("#f97316", "P"), scaledSize: new window.google.maps.Size(44, 58), anchor: new window.google.maps.Point(22, 56) };
    const dropIcon    = { url: DriverTrackingMapHelper.makePinUrl("#16a34a", "D"), scaledSize: new window.google.maps.Size(44, 58), anchor: new window.google.maps.Point(22, 56) };

    return (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
            {driverPos
                ? <LiveBadge updatedAt={driverLocation?.updated_at} driverName={driverName} />
                : <WaitingBanner driverName={driverName} />
            }

            <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={initCenter.current}
                zoom={14}
                options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    gestureHandling: "cooperative",
                    clickableIcons: false,
                }}
                onLoad={(m) => { mapRef.current = m; }}
            >
                {/* Route lines are drawn imperatively in useEffect for reliability */}

                {/* Pickup pin — orange P */}
                {pickupPos && (
                    <>
                        <MarkerF
                            position={pickupPos}
                            icon={pickupIcon}
                            title="Pickup"
                            zIndex={20}
                            onClick={() => setActiveInfo("pickup")}
                        />
                        {activeInfo === "pickup" && (
                            <InfoWindowF position={pickupPos} onCloseClick={() => setActiveInfo(null)}>
                                <div className="p-1 max-w-[180px]">
                                    <p className="font-semibold text-orange-600 text-sm">Pickup Point</p>
                                    {pickupLocation?.name    && <p className="text-gray-700 text-sm mt-0.5">{pickupLocation.name}</p>}
                                    {pickupLocation?.address && <p className="text-xs text-gray-500 mt-0.5">{pickupLocation.address}</p>}
                                </div>
                            </InfoWindowF>
                        )}
                    </>
                )}

                {/* Drop pin — green D */}
                {deliveryPos && (
                    <>
                        <MarkerF
                            position={deliveryPos}
                            icon={dropIcon}
                            title="Drop"
                            zIndex={20}
                            onClick={() => setActiveInfo("delivery")}
                        />
                        {activeInfo === "delivery" && (
                            <InfoWindowF position={deliveryPos} onCloseClick={() => setActiveInfo(null)}>
                                <div className="p-1 max-w-[180px]">
                                    <p className="font-semibold text-green-600 text-sm">Drop Point</p>
                                    {deliveryLocation?.name    && <p className="text-gray-700 text-sm mt-0.5">{deliveryLocation.name}</p>}
                                    {deliveryLocation?.address && <p className="text-xs text-gray-500 mt-0.5">{deliveryLocation.address}</p>}
                                </div>
                            </InfoWindowF>
                        )}
                    </>
                )}

                {/* Driver truck */}
                {driverPos && (
                    <>
                        <MarkerF
                            position={driverPos}
                            icon={truckIcon}
                            title={driverName}
                            zIndex={100}
                            onClick={() => setActiveInfo("driver")}
                        />
                        {activeInfo === "driver" && (
                            <InfoWindowF position={driverPos} onCloseClick={() => setActiveInfo(null)}>
                                <div className="p-1 max-w-[160px]">
                                    <p className="font-semibold text-blue-700 text-sm">{driverName}</p>
                                    {driverLocation?.accuracy && (
                                        <p className="text-xs text-gray-500 mt-0.5">+/-{Math.round(driverLocation.accuracy)} m accuracy</p>
                                    )}
                                </div>
                            </InfoWindowF>
                        )}
                    </>
                )}
            </GoogleMap>
        </div>
    );
}
