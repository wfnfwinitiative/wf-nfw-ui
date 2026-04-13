import React, { useState, useMemo } from 'react';
import { DriverAssignmentsGrid } from './DriverAssignmentsGrid';
import { HeroBanner } from '../../components/common';
import { DASHBOARD_FILTERS } from './utils/dashboardConfig';
import { useDriverTasksContext } from '../../contexts/DriverTasksContext';

export const DriverDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const { assignments } = useDriverTasksContext();

  const counts = useMemo(() => ({
    all:       assignments.length,
    assigned:  assignments.filter(a => a.status === 'assigned').length,
    inpicked:  assignments.filter(a => a.status === 'inpicked').length,
    delivered: assignments.filter(a => ['delivered', 'verified', 'completed'].includes(a.status)).length,
    rejected:  assignments.filter(a => a.status === 'rejected').length,
  }), [assignments]);

  return (
    <div className="space-y-6">
      <HeroBanner />

      {/* Filter Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {DASHBOARD_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 border text-left w-full transition-all ${
                isActive
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-gray-100 hover:shadow-lg hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 ${filter.color} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${filter.iconColor}`} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-800">
                  {counts[filter.key] ?? 0}
                </span>
              </div>
              <p className="text-sm md:text-base font-medium text-gray-600">{filter.label}</p>
            </button>
          );
        })}
      </div>

      {/* Assignments Grid */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          {DASHBOARD_FILTERS.find((f) => f.key === activeFilter)?.label ?? 'Your Assignments'}
        </h2>
        <DriverAssignmentsGrid
          statusFilter={DASHBOARD_FILTERS.find((f) => f.key === activeFilter)?.statuses}
        />
      </div>
    </div>
  );
};
