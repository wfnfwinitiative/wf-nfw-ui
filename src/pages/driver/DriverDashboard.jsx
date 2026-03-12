import React, { useState } from 'react';
import { Truck, Clock, Check, List } from 'lucide-react';
import { DriverAssignmentsGrid } from './DriverAssignmentsGrid';
import { HeroBanner } from '../../components/common';

const FILTERS = [
  {
    key: 'all',
    label: 'All Assignments',
    icon: List,
    color: 'bg-gray-100',
    iconColor: 'text-gray-600',
    statuses: null,
  },
  {
    key: 'assigned',
    label: 'Active Pickups',
    icon: Truck,
    color: 'bg-orange-100',
    iconColor: 'text-orange-600',
    statuses: ['assigned'],
  },
  {
    key: 'reached',
    label: 'In Progress',
    icon: Clock,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    statuses: ['reached', 'submitted'],
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: Check,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    statuses: ['delivered', 'verified'],
  },
];

export const DriverDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="space-y-6">
      <HeroBanner />

      {/* Filter Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {FILTERS.map((filter) => {
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
                {isActive && (
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base font-medium text-gray-600">{filter.label}</p>
            </button>
          );
        })}
      </div>

      {/* Assignments Grid */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          {FILTERS.find((f) => f.key === activeFilter)?.label ?? 'Your Assignments'}
        </h2>
        <DriverAssignmentsGrid statusFilter={FILTERS.find((f) => f.key === activeFilter)?.statuses} />
      </div>
    </div>
  );
};
