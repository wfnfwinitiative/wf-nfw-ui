import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  LabelList
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, Truck, Users, Home, MapPin, Download, ShieldCheck } from 'lucide-react';

import { HeroBanner } from '../../components/common';
import { useAuth } from '../../auth/AuthContext';
import { UserApi } from '../../services/api/userService';
import { Button } from '../../components/ui/Button';
import { VehicleApi } from '../../services/api/vehicleService';
import { DonorApi } from '../../services/api/donorService';
import { HungerSpotApi } from '../../services/api/hungerSpotService';
import { opportunityApi } from '../../services/api/oppurtunityService';
import { StatusApi } from '../../services/api/statusService';

function OpStatCard({ label, value, Icon, iconBg, iconColor, to, valueColor = 'text-ngo-dark', hoverBorder = 'hover:border-ngo-orange/30', iconRotate }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      className={`bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 cursor-pointer hover:shadow-lg ${hoverBorder} transition-all`}
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}${iconRotate ? ` ${iconRotate}` : ''}`} />
        </div>
        <span className={`text-2xl md:text-3xl lg:text-4xl font-bold ${valueColor}`}>{value}</span>
      </div>
      <p className="text-sm md:text-base font-medium text-ngo-gray">{label}</p>
    </div>
  );
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('admin');
  const isCoordinator = roles.includes('coordinator');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    let isCancelled = false;
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch admin-specific data only if user has admin role
        const adminsPromise = isAdmin ? UserApi.getUserByRole('ADMIN') : Promise.resolve([]);
        const coordinatorsPromise = isAdmin ? UserApi.getUserByRole('COORDINATOR') : Promise.resolve([]);
        const driversPromise = (isAdmin || isCoordinator) ? UserApi.getUserByRole('DRIVER') : Promise.resolve([]);

        // Fetch coordinator-specific data only if user has coordinator role
        const vehiclesPromise = isCoordinator ? VehicleApi.getVehicles() : Promise.resolve([]);
        const donorsPromise = isCoordinator ? DonorApi.getDonors() : Promise.resolve([]);
        const hungerSpotsPromise = isCoordinator ? HungerSpotApi.getHungerSpot() : Promise.resolve([]);
        const opportunitiesPromise = isCoordinator ? opportunityApi.getOpportunities() : Promise.resolve([]);
        const statusesPromise = isCoordinator ? StatusApi.getStatuses() : Promise.resolve([]);

        const [
          admins,
          coordinators,
          drivers,
          vehicles,
          donors,
          hungerSpots,
          opportunitiesData,
          statusesData,
        ] = await Promise.all([
          adminsPromise,
          coordinatorsPromise,
          driversPromise,
          vehiclesPromise,
          donorsPromise,
          hungerSpotsPromise,
          opportunitiesPromise,
          statusesPromise,
        ]);

        const getStartDate = (range) => {
          const now = new Date();
          now.setHours(0, 0, 0, 0); // Start of day
          switch (range) {
            case 'today':
              return now;
            case '7d':
              // Today and previous 6 days
              return new Date(now.setDate(now.getDate() - 6));
            case '30d':
              // Today and previous 29 days
              return new Date(now.setDate(now.getDate() - 29));
            default:
              return null;
          }
        };

        const allLocations = [
          ...(donors || []).filter(d => d.created_at),
          ...(hungerSpots || []).filter(h => h.created_at)
        ];

        const startDate = getStartDate(dateRange);

        const filteredLocations = startDate
          ? allLocations.filter(loc => new Date(loc.created_at) >= startDate)
          : allLocations;

        const monthlyPerformance = filteredLocations.reduce((acc, loc) => {
          const date = new Date(loc.created_at);
          const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          if (!acc[month]) {
            acc[month] = { month, count: 0, date };
          }
          acc[month].count++;
          return acc;
        }, {});

        const sortedMonthlyPerformance = Object.values(monthlyPerformance).sort((a, b) => a.date - b.date);

        const driverPerformance = (drivers || []).map(driver => ({
          name: driver.name.split(' ')[0],
          completed: 0,
          pending: 0,
        }));

        if (!isCancelled) {
          const countActive = (arr, field = 'status', activeVal = 'active') => {
            const items = arr || [];
            if (field === 'is_active') {
              const active = items.filter(i => i.is_active !== false).length;
              return { active, inactive: items.length - active };
            }
            if (field === 'isActive') {
              const active = items.filter(i => i.isActive !== false).length;
              return { active, inactive: items.length - active };
            }
            const active = items.filter(i => i[field] === activeVal).length;
            return { active, inactive: items.length - active };
          };

          // Count opportunities per status using fixed status IDs from seed script
          // 1=Created, 2=Assigned, 3=InPickup, 4=Rejected, 5=Delivered, 6=Verified, 7=Completed
          const opCounts = { assigned: 0, inpickup: 0, rejected: 0, delivered: 0, completed: 0 };
          (opportunitiesData || []).forEach(o => {
            const sid = o.new_status_id || o.status_id;
            if (sid === 2) opCounts.assigned++;
            else if (sid === 3) opCounts.inpickup++;
            else if (sid === 4) opCounts.rejected++;
            else if (sid === 5) opCounts.delivered++;
            else if (sid === 6 || sid === 7) opCounts.completed++;
          });

          setData({
            admins: countActive(admins, 'status'),
            coordinatorsCount: countActive(coordinators, 'status'),
            driversCount: countActive(drivers, 'status'),
            vehiclesCount: countActive(vehicles, 'is_active'),
            donorsCount: countActive(donors, 'isActive'),
            hungerSpotsCount: countActive(hungerSpots, 'is_active'),
            totalCoordinators: (coordinators || []).length,
            totalDrivers: (drivers || []).length,
            totalVehicles: (vehicles || []).length,
            totalDonors: (donors || []).length,
            totalHungerSpots: (hungerSpots || []).length,
            totalPickups: (donors || []).length,
            opTotal: (opportunitiesData || []).length,
            opAssigned: opCounts.assigned,
            opInpicked: opCounts.inpickup,
            opDelivered: opCounts.delivered,
            opRejected: opCounts.rejected,
            opCompleted: opCounts.completed,
            byMonth: sortedMonthlyPerformance,
            byDriver: driverPerformance,
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        if (!isCancelled) {
          setData({
            admins: { active: 0, inactive: 0 },
            coordinatorsCount: { active: 0, inactive: 0 },
            driversCount: { active: 0, inactive: 0 },
            vehiclesCount: { active: 0, inactive: 0 },
            donorsCount: { active: 0, inactive: 0 },
            hungerSpotsCount: { active: 0, inactive: 0 },
            totalCoordinators: 0,
            totalDrivers: 0,
            totalVehicles: 0,
            totalDonors: 0,
            totalHungerSpots: 0,
            totalPickups: 0,
            opTotal: 0,
            opAssigned: 0,
            opInpicked: 0,
            opDelivered: 0,
            opRejected: 0,
            opCompleted: 0,
            byMonth: [],
            byDriver: [],
          });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
    return () => { isCancelled = true; };
  }, [dateRange]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-ngo-gray">Loading dashboard...</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (!data) return;

    const { byMonth, byDriver, ...summary } = data;

    let csvContent = "data:text/csv;charset=utf-8,";

    // Summary Stats
    csvContent += "Resource,Count\r\n";
    csvContent += `Coordinators,${summary.totalCoordinators}\r\n`;
    csvContent += `Drivers,${summary.totalDrivers}\r\n`;
    csvContent += `Vehicles,${summary.totalVehicles}\r\n`;
    csvContent += `Donor Locations,${summary.totalDonors}\r\n`;
    csvContent += `Hunger Spots,${summary.totalHungerSpots}\r\n`;
    csvContent += "\r\n";

    // Monthly Performance
    csvContent += "New Locations Added Per Month\r\n";
    csvContent += "Month,Count\r\n";
    byMonth.forEach(row => {
      csvContent += `${row.month},${row.count}\r\n`;
    });
    csvContent += "\r\n";

    // Driver Performance
    csvContent += "Driver Performance\r\n";
    csvContent += "Driver,Completed,Pending\r\n";
    byDriver.forEach(row => {
      csvContent += `${row.name},${row.completed},${row.pending}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dashboard_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = data || {
    admins: { active: 0, inactive: 0 },
    coordinatorsCount: { active: 0, inactive: 0 },
    driversCount: { active: 0, inactive: 0 },
    vehiclesCount: { active: 0, inactive: 0 },
    donorsCount: { active: 0, inactive: 0 },
    hungerSpotsCount: { active: 0, inactive: 0 },
    totalCoordinators: 0,
    totalDrivers: 0,
    totalVehicles: 0,
    totalDonors: 0,
    totalHungerSpots: 0,
    totalPickups: 0,
    opTotal: 0,
    opAssigned: 0,
    opInpicked: 0,
    opDelivered: 0,
    opRejected: 0,
    opCompleted: 0,
    byMonth: [],
    byDriver: []
  };

  const userSummaryStats = [
    { label: 'Admins', counts: filtered.admins, icon: ShieldCheck, path: '/admin/admins' },
    { label: 'Coordinators', counts: filtered.coordinatorsCount, icon: Users, path: '/admin/coordinators' },
    { label: 'Drivers', counts: filtered.driversCount, icon: Users, path: '/admin/drivers' },
  ];

  const resourceSummaryStats = [
    ...(!isAdmin ? [{ label: 'Drivers', counts: filtered.driversCount, icon: Users, path: '/coordinator/drivers' }] : []),
    { label: 'Vehicles', counts: filtered.vehiclesCount, icon: Truck, path: '/coordinator/vehicles' },
    { label: 'Donors', counts: filtered.donorsCount, icon: Home, path: '/coordinator/donors' },
    { label: 'HungerSpots', counts: filtered.hungerSpotsCount, icon: MapPin, path: '/coordinator/hungerspots' },
  ];

  const dashboardTitle = isAdmin && isCoordinator
    ? 'Admin & Coordinator Dashboard'
    : isCoordinator
      ? 'Coordinator Dashboard'
      : 'Admin Dashboard';

  return (
    <div className="space-y-6 md:space-y-8">
      <HeroBanner />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1 md:mb-2">
            {dashboardTitle}
          </h1>
          <p className="text-sm md:text-base text-ngo-gray">Operational and analytics overview</p>
        </div>
        <div className="flex flex-row items-center justify-end gap-3 flex-wrap md:flex-nowrap min-h-[44px]">
          <span className="text-sm md:text-base text-ngo-gray whitespace-nowrap">Date range:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm md:text-base text-ngo-dark bg-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none min-h-[44px] touch-manipulation"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
           <Button onClick={handleDownload} variant="primary" className="w-full sm:w-auto shrink-0 touch-manipulation">
            <Download className="w-5 h-5" />
            Download Report
          </Button>
        </div>
      </div>

      {isCoordinator && (
      <section>
        <h2 className="text-lg md:text-xl font-bold text-ngo-dark mb-4 md:mb-6">
          Opportunity Summary
        </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        {[
          { label: 'Total Opportunities', value: filtered.opTotal,    Icon: TrendingUp,  iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   to: '/coordinator/review-opportunities' },
          { label: 'Assigned',            value: filtered.opAssigned, Icon: Clock,       iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  to: '/coordinator/review-opportunities?status=assigned' },
          { label: 'In-Pickup',           value: filtered.opInpicked, Icon: Truck,       iconBg: 'bg-orange-100', iconColor: 'text-ngo-orange', to: '/coordinator/review-opportunities?status=InPickup' },
          { label: 'Delivered',           value: filtered.opDelivered,Icon: MapPin,      iconBg: 'bg-purple-100', iconColor: 'text-purple-600', to: '/coordinator/review-opportunities?status=delivered' },
          { label: 'Rejected',            value: filtered.opRejected, Icon: TrendingUp,  iconBg: 'bg-red-100',    iconColor: 'text-red-500',    to: '/coordinator/review-opportunities?status=rejected', valueColor: 'text-red-600', hoverBorder: 'hover:border-red-300', iconRotate: 'rotate-180' },
          { label: 'Completed',           value: filtered.opCompleted,Icon: CheckCircle, iconBg: 'bg-green-100',  iconColor: 'text-ngo-green',  to: '/coordinator/review-opportunities?status=completed' },
        ].map(({ Icon, ...props }) => (
          <OpStatCard key={props.label} Icon={Icon} {...props} />
        ))}
      </div>
      </section>
      )}

      {isAdmin && (
      <section>
        <h2 className="text-lg md:text-xl font-bold text-ngo-dark mb-4 md:mb-6">
          Users Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {userSummaryStats.map(stat => (
            <div key={stat.label} onClick={() => navigate(stat.path)} className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 text-center cursor-pointer hover:shadow-lg hover:border-ngo-orange/30 transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <span className="text-2xl md:text-3xl font-bold block">
                <span className="text-green-600">{stat.counts.active}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-red-500">{stat.counts.inactive}</span>
              </span>
              <p className="text-sm md:text-base font-medium text-ngo-gray">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">active / inactive</p>
            </div>
          ))}
        </div>
      </section>
      )}

      {isCoordinator && (
      <section>
        <h2 className="text-lg md:text-xl font-bold text-ngo-dark mb-4 md:mb-6">
          Resource Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {resourceSummaryStats.map(stat => (
            <div key={stat.label} onClick={() => navigate(stat.path)} className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 text-center cursor-pointer hover:shadow-lg hover:border-ngo-orange/30 transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <span className="text-2xl md:text-3xl font-bold block">
                <span className="text-green-600">{stat.counts.active}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-red-500">{stat.counts.inactive}</span>
              </span>
              <p className="text-sm md:text-base font-medium text-ngo-gray">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">active / inactive</p>
            </div>
          ))}
        </div>
      </section>
      )}

      <section>
        <h2 className="text-lg md:text-xl font-bold text-ngo-dark mb-4 md:mb-6">
          Operational Insights
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 w-full min-w-0">
            <h3 className="text-sm md:text-base font-bold text-ngo-dark mb-4 md:mb-6">
              New Locations Added Per Month
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filtered.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF6B35"
                  name="New Locations"
                  strokeWidth={2}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 w-full min-w-0">
            <h3 className="text-sm md:text-base font-bold text-ngo-dark mb-4 md:mb-6">
              Driver Performance (Completed vs Pending)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filtered.byDriver}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} domain={[0, 'dataMax + 2']} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#4CAF50" name="Completed">
                  <LabelList dataKey="completed" position="top" />
                </Bar>
                <Bar dataKey="pending" stackId="a" fill="#FF9800" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};
