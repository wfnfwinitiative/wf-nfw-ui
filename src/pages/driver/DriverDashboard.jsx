import React from 'react';
import { Truck, Clock, Check } from 'lucide-react';
import { DriverAssignmentsGrid } from './DriverAssignmentsGrid';

import { HeroBanner } from '../../components/common';

export const DriverDashboard = () => {
  return (
    <div>
      <HeroBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Active Pickups</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">1</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Completed Today</p>
              <p className="text-3xl font-bold text-gray-900">2</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Your Assignments</h2>
        <DriverAssignmentsGrid />
      </div>
    </div>
  );
};
