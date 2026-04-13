import { useDriverTasksContext } from '../../../contexts/DriverTasksContext';

/**
 * Returns shared driver assignment data from DriverTasksContext.
 * between Dashboard and Tasks does NOT trigger a second API call.
 */
export function useDriverTasks() {
  return useDriverTasksContext();
}
