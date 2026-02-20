import { useAuth, ROLES } from '../contexts/AuthContext';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { DriverAssignmentsGrid } from '../components/driver/DriverAssignmentsGrid';

export function DashboardPage() {
  const { user, isDriver } = useAuth();

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
