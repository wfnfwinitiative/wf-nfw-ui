import { useAuth, ROLES } from '../contexts/AuthContext';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { DriverAssignmentsGrid } from '../components/driver/DriverAssignmentsGrid';
import { useNavigate } from 'react-router-dom';
import { mockOpportunities } from '../services/mockData';
import { Package, User, Truck, Clock, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../components/common';

const STATUS_COLORS = {
  created: 'gray',
  assigned: 'blue',
  picked_up: 'amber',
  delivered: 'green',
  verified: 'purple',
};

export function DashboardPage() {
  const { user, isDriver, isCoordinator, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Get recent/pending pickups for coordinator view
  const pendingPickups = mockOpportunities
    .filter(p => ['created', 'assigned', 'picked_up', 'delivered'].includes(p.status?.status_name))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Summary Cards */}
      <SummaryCards />

      {/* Driver-specific: Show assignments grid */}
      {isDriver && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Assigned Pickups
          </h2>
          <DriverAssignmentsGrid />
        </section>
      )}

      {/* Coordinator-specific: Show pending pickups overview */}
      {(isCoordinator || isAdmin) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Pickups
            </h2>
            <button
              onClick={() => navigate('/pickups')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {pendingPickups.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No pending pickups
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingPickups.map((pickup) => (
                  <div
                    key={pickup.opportunity_id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/pickups')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {pickup.donor?.donor_name || 'Unknown Donor'}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            {pickup.driver && (
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {pickup.driver.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(pickup.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge 
                        status={pickup.status?.status_name || 'created'} 
                        color={STATUS_COLORS[pickup.status?.status_name] || 'gray'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <RecentActivity />
      </section>
    </div>
  );
}

export default DashboardPage;
