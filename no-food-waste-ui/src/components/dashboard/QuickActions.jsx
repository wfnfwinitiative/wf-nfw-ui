import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Truck, ClipboardList, Users, BarChart3 } from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();
  const { isAdmin, isCoordinator, isDriver } = useAuth();

  const driverActions = [
    {
      title: 'View My Pickups',
      description: 'See all assigned pickup tasks',
      icon: ClipboardList,
      color: 'bg-blue-500',
      onClick: () => navigate('/assignments'),
    },
  ];

  const coordinatorActions = [
    {
      title: 'Create Pickup',
      description: 'Create a new pickup request',
      icon: Plus,
      color: 'bg-primary-500',
      onClick: () => navigate('/pickups/new'),
    },
    {
      title: 'Driver Status',
      description: 'View live driver locations',
      icon: Truck,
      color: 'bg-blue-500',
      onClick: () => navigate('/drivers'),
    },
    {
      title: 'Pending Verifications',
      description: 'Review submitted pickups',
      icon: ClipboardList,
      color: 'bg-amber-500',
      onClick: () => navigate('/pickups?status=submitted'),
    },
  ];

  const adminActions = [
    {
      title: 'Manage Users',
      description: 'Add or edit system users',
      icon: Users,
      color: 'bg-purple-500',
      onClick: () => navigate('/users'),
    },
    {
      title: 'Assign Pickup',
      description: 'Create and assign pickups',
      icon: Plus,
      color: 'bg-primary-500',
      onClick: () => navigate('/assign'),
    },
    {
      title: 'View Analytics',
      description: 'Detailed reports and stats',
      icon: BarChart3,
      color: 'bg-blue-500',
      onClick: () => navigate('/analytics'),
    },
  ];

  let actions = [];
  if (isDriver) actions = driverActions;
  else if (isCoordinator) actions = coordinatorActions;
  else if (isAdmin) actions = adminActions;

  if (actions.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-left hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
