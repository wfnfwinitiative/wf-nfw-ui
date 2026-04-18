import React, { useState, useEffect, useMemo } from 'react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, Truck, Users, Home, MapPin, Download, ShieldCheck, Loader2, ClipboardList} from 'lucide-react';

import { HeroBanner } from '../../components/common';
import { useAuth } from '../../auth/AuthContext';
import { UserApi } from '../../services/api/userService';
import { Button } from '../../components/ui/Button';
import { VehicleApi } from '../../services/api/vehicleService';
import { DonorApi } from '../../services/api/donorService';
import { HungerSpotApi } from '../../services/api/hungerSpotService';
import { opportunityApi } from '../../services/api/oppurtunityService';

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

  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const oneMonthAgo = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); })();
  const [fromDate, setFromDate] = useState(oneMonthAgo);
  const [toDate, setToDate] = useState(today);

  // Fetch all API data once on mount
  useEffect(() => {
    let isCancelled = false;
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const adminsPromise = isAdmin ? UserApi.getUserByRole('ADMIN') : Promise.resolve([]);
        const coordinatorsPromise = isAdmin ? UserApi.getUserByRole('COORDINATOR') : Promise.resolve([]);
        const driversPromise = (isAdmin || isCoordinator) ? UserApi.getUserByRole('DRIVER') : Promise.resolve([]);
        const vehiclesPromise = isCoordinator ? VehicleApi.getVehicles() : Promise.resolve([]);
        const donorsPromise = isCoordinator ? DonorApi.getDonors() : Promise.resolve([]);
        const hungerSpotsPromise = isCoordinator ? HungerSpotApi.getHungerSpot() : Promise.resolve([]);
        const opportunitiesPromise = (isAdmin || isCoordinator) ? opportunityApi.getOpportunities() : Promise.resolve([]);

        const [admins, coordinators, drivers, vehicles, donors, hungerSpots, opportunities] =
          await Promise.all([adminsPromise, coordinatorsPromise, driversPromise, vehiclesPromise, donorsPromise, hungerSpotsPromise, opportunitiesPromise]);

        if (!isCancelled) {
          setRawData({ admins, coordinators, drivers, vehicles, donors, hungerSpots, opportunities });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        if (!isCancelled) setRawData({ admins: [], coordinators: [], drivers: [], vehicles: [], donors: [], hungerSpots: [], opportunities: [] });
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    loadDashboardData();
    return () => { isCancelled = true; };
  }, []);

  // Recompute derived stats whenever rawData, fromDate or toDate changes — no API call needed
  const data = useMemo(() => {
    if (!rawData) return null;
    const { admins, coordinators, drivers, vehicles, donors, hungerSpots, opportunities } = rawData;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? (() => { const d = new Date(toDate); d.setHours(23, 59, 59, 999); return d; })() : null;

    const inRange = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    };

    const countActive = (arr, field = 'status', activeVal = 'active') => {
      const items = arr || [];
      if (field === 'is_active') { const a = items.filter(i => i.is_active !== false).length; return { active: a, inactive: items.length - a }; }
      if (field === 'isActive')  { const a = items.filter(i => i.isActive  !== false).length; return { active: a, inactive: items.length - a }; }
      const a = items.filter(i => i[field] === activeVal).length;
      return { active: a, inactive: items.length - a };
    };

    // Status counts — pending by delivery_by, completed by delivered_at
    const opCounts = { assigned: 0, inpickup: 0, rejected: 0, delivered: 0, completed: 0 };
    const filteredOps = (opportunities || []).filter(o => {
      const sid = o.new_status_id || o.status_id;
      const isPending = [1, 2, 3, 4].includes(sid);
      const dateField = isPending ? o.delivery_by : o.delivered_at;
      return !from && !to ? true : inRange(dateField || o.created_at);
    });
    filteredOps.forEach(o => {
      const sid = o.new_status_id || o.status_id;
      if (sid === 2) opCounts.assigned++;
      else if (sid === 3) opCounts.inpickup++;
      else if (sid === 4) opCounts.rejected++;
      else if (sid === 5) opCounts.delivered++;
      else if (sid === 6 || sid === 7) opCounts.completed++;
    });

    // Impact chart — filter by delivered_at
    const impactByMonth = (opportunities || [])
      .filter(o => o.delivered_at && inRange(o.delivered_at))
      .reduce((acc, o) => {
        const date = new Date(o.delivered_at);
        const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!acc[month]) acc[month] = { month, foodKg: 0, peopleFed: 0, date };
        acc[month].foodKg += Number(o.food_collected) || 0;
        acc[month].peopleFed += Number(o.feeding_count) || 0;
        return acc;
      }, {});
    const byImpact = Object.values(impactByMonth).sort((a, b) => a.date - b.date);

    return {
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
      opTotal: filteredOps.length,
      opAssigned: opCounts.assigned,
      opInpicked: opCounts.inpickup,
      opDelivered: opCounts.delivered,
      opRejected: opCounts.rejected,
      opCompleted: opCounts.completed,
      opStatusDonut: [
        { name: 'Assigned',  value: opCounts.assigned,  color: '#3B82F6' },
        { name: 'In-Pickup', value: opCounts.inpickup,  color: '#F97316' },
        { name: 'Delivered', value: opCounts.delivered, color: '#22C55E' },
        { name: 'Rejected',  value: opCounts.rejected,  color: '#EF4444' },
        { name: 'Completed', value: opCounts.completed, color: '#6B7280' },
      ].filter(d => d.value > 0),
      byImpact,
    };
  }, [rawData, fromDate, toDate]);

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
    opStatusDonut: [],
    byImpact: [],
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
        <div className="flex flex-row items-center justify-end gap-3 flex-wrap min-h-[44px]">
          <div className="flex items-center gap-2">
            <label className="text-sm text-ngo-gray whitespace-nowrap">From:</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-ngo-dark bg-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none min-h-[44px]" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-ngo-gray whitespace-nowrap">To:</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-ngo-dark bg-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none min-h-[44px]" />
          </div>
        </div>
      </div>
      {loading && !data ? (
        <div className="flex flex-col justify-center items-center p-16 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
          <p className="text-gray-500">Loading data...</p>
        </div>
      ) : (
      <>

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
          {/* Donut — Opportunities by Status */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 w-full min-w-0">
            <h3 className="text-sm md:text-base font-bold text-ngo-dark mb-4 md:mb-6">
              Opportunities by Status
            </h3>
            {filtered.opStatusDonut.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No opportunity data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filtered.opStatusDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={true}
                  >
                    {filtered.opStatusDonut.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar — Food Collected & People Fed per Month */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 w-full min-w-0">
            <h3 className="text-sm md:text-base font-bold text-ngo-dark mb-4 md:mb-6">
              Impact per Month — Food Collected (kg) & People Fed
            </h3>
            {filtered.byImpact.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No delivery data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filtered.byImpact} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="foodKg" fill="#FF6B35" name="Food (kg)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="peopleFed" fill="#22C55E" name="People Fed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
      </>
      )}
    </div>
  );
};
