import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, RefreshCw, Truck, Users, AlertCircle, Loader2 } from 'lucide-react';
import { serviceApi } from '../../services/api/apiClient';
import { driverLocationApi } from '../../services/api/driverLocationService';
import { DriverTrackingMap } from '../../components/common/DriverTrackingMap';
import { StatusBadge } from '../../components/StatusBadge';

const STATUS_LABEL = {
  2: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'In-Transit', color: 'bg-orange-100 text-orange-700' },
};

function TaskRow({ task, isSelected, onSelect }) {
  const status = STATUS_LABEL[task.status_id] ?? { label: task.status_name, color: 'bg-gray-100 text-gray-600' };
  return (
    <button
      onClick={() => onSelect(task)}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-orange-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {task.driver_name ?? `Driver #${task.driver_id}`}
            </p>
            <p className="text-xs text-gray-500 truncate">{task.donor_name}</p>
          </div>
        </div>
        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>
          {status.label}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
        <span className="truncate">
          <span className="font-medium text-orange-600">P</span> {task.pickup_location ?? 'No address'}
        </span>
        <span className="truncate">
          <span className="font-medium text-green-600">D</span> {task.hunger_spot_name ?? task.drop_location ?? 'Unknown'}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-400">Opp #{task.opportunity_id}</p>
    </button>
  );
}

export function LiveDriverTracking() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  // Accumulated GPS trail keyed by opportunity_id — persists across polls for the session
  const traveledPathsRef = useRef({});  // { [opportunityId]: [{lat, lng}, ...] }

  const loadTasks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await serviceApi.get('/api/opportunities/active-tracking');
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load active opportunities. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Minimum meters the driver must move before adding a new trail point.
  // Prevents WiFi/laptop GPS noise from drawing false lines.
  const MIN_MOVEMENT_M = 30;

  const haversineM = (a, b) => {
    const R = 6371000;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const loadDriverLocation = useCallback(async (opportunityId) => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const loc = await driverLocationApi.getLocation(opportunityId);
      // Only append to trail if driver moved more than MIN_MOVEMENT_M metres
      const newPoint = { lat: loc.latitude, lng: loc.longitude };
      const trail = traveledPathsRef.current[opportunityId] ?? [];
      const last = trail[trail.length - 1];
      const moved = !last || haversineM(last, newPoint) >= MIN_MOVEMENT_M;
      if (moved) {
        traveledPathsRef.current = {
          ...traveledPathsRef.current,
          [opportunityId]: [...trail, newPoint],
        };
      }
      setDriverLocation(loc);
    } catch (err) {
      if (err?.response?.status === 404) {
        setLocationError(null); // driver hasn't shared yet — show waiting state
      } else {
        setLocationError('Unable to fetch driver location.');
      }
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const handleSelectTask = useCallback((task) => {
    setSelectedTask(task);
    setDriverLocation(null); // clear stale location while loading new one
    loadDriverLocation(task.opportunity_id);
  }, [loadDriverLocation]);

  // Poll driver location every 10 s while a task is selected
  useEffect(() => {
    if (!selectedTask) return;
    const id = setInterval(() => loadDriverLocation(selectedTask.opportunity_id), 10_000);
    return () => clearInterval(id);
  }, [selectedTask, loadDriverLocation]);

  const pickupLocation = selectedTask?.pickup_lat != null
    ? { latitude: selectedTask.pickup_lat, longitude: selectedTask.pickup_lng }
    : null;

  const deliveryLocation = selectedTask?.drop_lat != null
    ? { latitude: selectedTask.drop_lat, longitude: selectedTask.drop_lng }
    : null;

  const traveledPath = selectedTask
    ? (traveledPathsRef.current[selectedTask.opportunity_id] ?? [])
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
            Live Driver Tracking
          </h1>
          <p className="text-sm text-gray-500">
            Monitor active drivers in real-time. Select a task to view the map.
          </p>
        </div>
        <button
          onClick={() => loadTasks(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading active tasks…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => loadTasks()}
            className="mt-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-gray-50 rounded-2xl border border-gray-100">
          <Users className="w-10 h-10 text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">No active drivers right now</p>
          <p className="text-xs text-gray-400">Assigned and in-transit opportunities will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task list */}
          <div className="lg:col-span-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              {tasks.length} Active Task{tasks.length !== 1 ? 's' : ''}
            </p>
            {tasks.map((task) => (
              <TaskRow
                key={task.opportunity_id}
                task={task}
                isSelected={selectedTask?.opportunity_id === task.opportunity_id}
                onSelect={handleSelectTask}
              />
            ))}
          </div>

          {/* Map panel */}
          <div className="lg:col-span-2">
            {!selectedTask ? (
              <div className="h-[500px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 gap-3">
                <MapPin className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-gray-500 font-medium">Select a task to view the live map</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Task info bar */}
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {selectedTask.driver_name ?? `Driver #${selectedTask.driver_id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedTask.donor_name} → {selectedTask.hunger_spot_name ?? selectedTask.drop_location ?? 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {locationLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      STATUS_LABEL[selectedTask.status_id]?.color ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_LABEL[selectedTask.status_id]?.label ?? selectedTask.status_name}
                    </span>
                  </div>
                </div>

                {locationError && (
                  <div className="px-5 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {locationError}
                  </div>
                )}

                {!pickupLocation && (
                  <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Donor location has no coordinates set — edit the donor and pin it on the map to show the pickup marker.
                  </div>
                )}

                {/* Map */}
                <div style={{ height: '460px' }}>
                  <DriverTrackingMap
                    driverLocation={driverLocation}
                    pickupLocation={pickupLocation}
                    deliveryLocation={deliveryLocation}
                    traveledPath={traveledPath}
                    driverName={selectedTask.driver_name ?? `Driver #${selectedTask.driver_id}`}
                    height="460px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveDriverTracking;
