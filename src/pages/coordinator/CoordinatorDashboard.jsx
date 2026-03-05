import React from 'react';
import { TileCard } from '../../components/TileCard';
import { Truck, Users, FileCheck } from 'lucide-react';

import { HeroBanner } from '../../components/common';

export const CoordinatorDashboard = () => {
  return (
    <div>
      <HeroBanner />
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1 md:mb-2">Coordinator Dashboard</h1>
        <p className="text-sm md:text-base text-ngo-gray">Manage pickups and operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TileCard
          icon={Truck}
          title="Create Pickup"
          description="Schedule new food pickup and assign drivers"
          to="/coordinator/create-pickup"
          color="orange"
        />

        <TileCard
          icon={Users}
          title="Driver Status"
          description="View active drivers and their current tasks"
          to="/coordinator/drivers"
          color="green"
        />

        <TileCard
          icon={FileCheck}
          title="Pending Verifications"
          description="Review submitted pickup proofs"
          to="/verification"
          color="blue"
        />
      </div>
    </div>
  );
};
