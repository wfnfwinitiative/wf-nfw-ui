import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/mockApi';
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
import { TrendingUp, CheckCircle, Clock, Truck } from 'lucide-react';

import { HeroBanner } from '../../components/common';

export const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const result = await mockApi.getFilteredDashboardData(dateRange);
      if (!cancelled) {
        setData(result);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [dateRange]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-ngo-gray">Loading dashboard...</p>
      </div>
    );
  }

  const filtered = data || {
    totalPickups: 0,
    verified: 0,
    pending: 0,
    inProgress: 0,
    byMonth: [],
    byDriver: []
  };

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
          Operational Insights
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border border-gray-100 w-full min-w-0">
            <h3 className="text-sm md:text-base font-bold text-ngo-dark mb-4 md:mb-6">
              Monthly Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filtered.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} domain={[0, 'dataMax + 2']} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pickups"
                  stroke="#FF6B35"
                  name="Total Pickups"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="verified"
                  stroke="#4CAF50"
                  name="Verified"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="avgLatencyHours"
                  stroke="#F59E0B"
                  name="Avg Verification Time (hrs)"
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
                <XAxis dataKey="name" />
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
