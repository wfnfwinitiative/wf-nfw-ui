import { Package, MapPin, Truck, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockAnalytics, mockAssignments } from '../../services/mockData';

export function SummaryCards() {
  const { isAdmin, isCoordinator, isDriver } = useAuth();

  // Driver-specific stats
  const driverStats = [
    {
      title: 'Assigned Pickups',
      value: mockAssignments.filter(a => a.status === 'assigned').length,
      icon: Package,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'In Progress',
      value: mockAssignments.filter(a => ['reached', 'submitted'].includes(a.status)).length,
      icon: Truck,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
    },
    {
      title: 'Delivered Today',
      value: mockAssignments.filter(a => a.status === 'delivered').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
    {
      title: 'Verified',
      value: mockAssignments.filter(a => a.status === 'verified').length,
      icon: CheckCircle,
      color: 'bg-primary-500',
      bgLight: 'bg-primary-50',
    },
  ];

  const stats = isDriver ? driverStats : [];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bgLight}`}>
              <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            {stat.trend && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            )}
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
