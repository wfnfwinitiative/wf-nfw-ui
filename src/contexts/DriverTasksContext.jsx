import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { serviceApi } from '../services/api/apiClient';
import { toDriverAssignment } from '../pages/driver/utils/assignmentMapper';

const DriverTasksContext = createContext(null);

/**
 * Provides driver assignment data to all driver pages.
 * The API call is made once when the driver layout mounts,
 * so navigating between Dashboard and Tasks reuses cached data.
 */
export function DriverTasksProvider({ children }) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await serviceApi.get(`/api/opportunities/driver/${user.id}`);
        if (!cancelled) setAssignments(data.map(toDriverAssignment));
      } catch (err) {
        console.error('Failed to fetch driver tasks:', err);
        if (!cancelled) setError('Failed to load tasks. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleStatusUpdate = useCallback((assignmentId, newStatus, additionalData = {}) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: newStatus,
              ...additionalData,
              timeline: [
                ...(a.timeline || []),
                { status: newStatus, timestamp: new Date().toISOString() },
              ],
            }
          : a
      )
    );
  }, []);

  return (
    <DriverTasksContext.Provider value={{ assignments, loading, error, handleStatusUpdate }}>
      {children}
    </DriverTasksContext.Provider>
  );
}

export function useDriverTasksContext() {
  const ctx = useContext(DriverTasksContext);
  if (!ctx) throw new Error('useDriverTasksContext must be used within DriverTasksProvider');
  return ctx;
}
