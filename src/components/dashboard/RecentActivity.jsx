import { Package, Truck, CheckCircle, UserPlus, Clock } from 'lucide-react';
import { mockRecentActivity } from '../../services/mockData';

const activityIcons = {
  delivery: { icon: Package, color: 'bg-green-100 text-green-600' },
  pickup: { icon: Truck, color: 'bg-blue-100 text-blue-600' },
  verification: { icon: CheckCircle, color: 'bg-purple-100 text-purple-600' },
  assignment: { icon: Truck, color: 'bg-amber-100 text-amber-600' },
  user: { icon: UserPlus, color: 'bg-pink-100 text-pink-600' },
};

export function RecentActivity() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {mockRecentActivity.map((activity) => {
        const { icon: Icon, color } = activityIcons[activity.type] || activityIcons.delivery;
        
        return (
          <div key={activity.id} className="flex items-start gap-4 p-4">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {activity.time}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RecentActivity;
