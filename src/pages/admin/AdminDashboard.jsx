import React, { useState, useEffect } from 'react';
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
import { TrendingUp, CheckCircle, Clock, Truck, Users, Home, MapPin, Download } from 'lucide-react';

import { HeroBanner } from '../../components/common';
import { UserApi } from '../../services/api/userService';
import { Button } from '../../components/ui/Button';
import { VehicleApi } from '../../services/api/vehicleService';
import { DonorApi } from '../../services/api/donorService';
import { HungerSpotApi } from '../../services/api/hungerSpotService';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    let isCancelled = false;
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [
          coordinators,
          drivers,
          vehicles,
          donors,
          hungerSpots
        ] = await Promise.all([
          UserApi.getUserByRole('COORDINATOR'),
          UserApi.getUserByRole('DRIVER'),
          VehicleApi.getVehicles(),
          DonorApi.getDonors(),
          HungerSpotApi.getHungerSpot()
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
          setData({
            totalCoordinators: (coordinators || []).length,
            totalDrivers: (drivers || []).length,
            totalVehicles: (vehicles || []).length,
            totalDonors: (donors || []).length,
            totalHungerSpots: (hungerSpots || []).length,
            totalPickups: (donors || []).length,
            verified: 0,
            pending: 0,
            inProgress: 0,
            byMonth: sortedMonthlyPerformance,
            byDriver: driverPerformance,
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        if (!isCancelled) {
          setData({
            totalCoordinators: 0,
            totalDrivers: 0,
            totalVehicles: 0,
            totalDonors: 0,
            totalHungerSpots: 0,
            totalPickups: 0,
            verified: 0,
            pending: 0,
            inProgress: 0,
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
    csvContent += `Pickup Locations,${summary.totalDonors}\r\n`;
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
    totalCoordinators: 0,
    totalDrivers: 0,
    totalVehicles: 0,
    totalDonors: 0,
    totalHungerSpots: 0,
    totalPickups: 0,
    verified: 0,
    pending: 0,
    inProgress: 0,
    byMonth: [],
    byDriver: []
  };

  const summaryStats = [
    { label: 'Coordinators', value: filtered.totalCoordinators, icon: Users },
    { label: 'Drivers', value: filtered.totalDrivers, icon: Users },
    { label: 'Vehicles', value: filtered.totalVehicles, icon: Truck },
    { label: 'Donors', value: filtered.totalDonors, icon: Home },
    { label: 'HungerSpots', value: filtered.totalHungerSpots, icon: MapPin },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <HeroBanner />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1 md:mb-2">
            Admin Dashboard
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-ngo-dark">
              {filtered.totalPickups}
            </span>
          </div>
          <p className="text-sm md:text-base font-medium text-ngo-gray">Total Pickups</p>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-ngo-green" />
            </div>
            <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-ngo-dark">
              {filtered.verified}
            </span>
          </div>
          <p className="text-sm md:text-base font-medium text-ngo-gray">Verified</p>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
            </div>
            <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-ngo-dark">
              {filtered.pending}
            </span>
          </div>
          <p className="text-sm md:text-base font-medium text-ngo-gray">Pending</p>
        </div>
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 md:w-6 md:h-6 text-ngo-orange" />
            </div>
            <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-ngo-dark">
              {filtered.inProgress}
            </span>
          </div>
          <p className="text-sm md:text-base font-medium text-ngo-gray">In Progress</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg md:text-xl font-bold text-ngo-dark mb-4 md:mb-6">
          Resource Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {summaryStats.map(stat => (
            <div key={stat.label} className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-ngo-dark block">
                {stat.value}
              </span>
              <p className="text-sm md:text-base font-medium text-ngo-gray">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

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
