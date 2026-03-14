import { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { serviceApi } from '../../../services/api/apiClient';
import { toDriverAssignment } from '../utils/assignmentMapper';

/**
 * Fetches the driver's assignments and exposes a status-update handler.
 * Keeps all data-fetching side-effects out of the page component.
 */
export function useDriverTasks() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await serviceApi.get(`/api/opportunities/driver/${user.id}`);
        if (!cancelled) setAssignments(data.map(toDriverAssignment));
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        if (!cancelled) setError('Failed to load tasks. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleStatusUpdate = (assignmentId, newStatus, additionalData = {}) => {
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
  };

  return { assignments, loading, error, handleStatusUpdate };
}
