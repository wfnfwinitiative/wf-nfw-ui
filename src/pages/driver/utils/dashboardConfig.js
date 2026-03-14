import { Truck, Clock, Check, List } from 'lucide-react';

/**
 * Dashboard filter card definitions.
 * Each entry drives both the summary tile (icon, colour, label) and the
 * status filter passed to DriverAssignmentsGrid.
 */
export const DASHBOARD_FILTERS = [
  {
    key:       'all',
    label:     'All Assignments',
    icon:      List,
    color:     'bg-gray-100',
    iconColor: 'text-gray-600',
    statuses:  null,
  },
  {
    key:       'assigned',
    label:     'Active Pickups',
    icon:      Truck,
    color:     'bg-orange-100',
    iconColor: 'text-orange-600',
    statuses:  ['assigned'],
  },
  {
    key:       'inpicked',
    label:     'In Progress',
    icon:      Clock,
    color:     'bg-orange-100',
    iconColor: 'text-orange-600',
    statuses:  ['inpicked'],
  },
  {
    key:       'delivered',
    label:     'Delivered',
    icon:      Check,
    color:     'bg-green-100',
    iconColor: 'text-green-600',
    statuses:  ['delivered', 'verified', 'completed'],
  },
];
