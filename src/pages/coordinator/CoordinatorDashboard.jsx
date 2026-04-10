import React from 'react';
import { TileCard } from '../../components/TileCard';
import { Truck, Users, FileCheck, MapPin } from 'lucide-react';

import { HeroBanner } from '../../components/common';
import { useFeatureFlags, FEATURE_FLAGS } from '../../contexts/FeatureFlagsContext';

export const CoordinatorDashboard = () => {
  const { isFeatureEnabled } = useFeatureFlags();
  const trackingEnabled = isFeatureEnabled(FEATURE_FLAGS.DRIVER_TRACKING);

  return (
    <div>
      <HeroBanner />
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1 md:mb-2">Coordinator Dashboard</h1>
        <p className="text-sm md:text-base text-ngo-gray">Manage opportunities and operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TileCard
          icon={Truck}
          title="Create Opportunity"
          description="Schedule new opportunity and assign drivers"
          to="/coordinator/create-opportunity"
          color="orange"
        />

        {trackingEnabled && (
          <TileCard
            icon={MapPin}
            title="Live Driver Tracking"
            description="Monitor active drivers in real-time on the map"
            to="/coordinator/live-tracking"
            color="green"
          />
        )}

        {/* <TileCard
          icon={Users}
          title="Driver Status"
          description="View active drivers and their current tasks"
          to="/coordinator/drivers"
          color="green"
        /> */}

        <TileCard
          icon={FileCheck}
          title="Review Opportunities"
          description="Review submitted opportunity proofs"
          to="/coordinator/review-opportunities"
          color="blue"
        />
      </div>
    </div>
  );
};
