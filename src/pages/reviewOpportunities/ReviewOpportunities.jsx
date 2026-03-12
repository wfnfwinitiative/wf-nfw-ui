import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, SearchBar } from '../../components/ui';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { TileCard } from '../../components/cards/TileCard';
import { opportunityApi } from '../../services/api/oppurtunityService';
import { HungerSpotApi } from '../../services/api/hungerSpotService';
import { DonorApi } from '../../services/api/donorService';
import { UserApi } from '../../services/api/userService';
import { VehicleApi } from '../../services/api/vehicleService';
import { useReviewOpportunitiesMetadata } from '../../contexts/ReviewOpportunitiesContext';
import { Spinner } from '../../components/common/Spinner';
import { Edit } from 'lucide-react';

export const ReviewOpportunities = () => {
  const navigate = useNavigate();
  const { updateMetadata } = useReviewOpportunitiesMetadata();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // metadata caches
  const [pickupLocations, setPickupLocations] = useState([]);
  const [hungerSpots, setHungerSpots] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);

      // fetch all data in parallel
      const [pickup, hunger, driversData, vehiclesData, data] = await Promise.all([
        DonorApi.getDonors(),
        HungerSpotApi.getHungerSpot(),
        UserApi.getUserByRole('DRIVER'),
        VehicleApi.getVehicles(),
        opportunityApi.getOpportunities(),
      ]);
      setPickupLocations(pickup || []);
      setHungerSpots(hunger || []);
      const activeDrivers = (driversData || []).filter((d) => d.status === 'active');
      setDrivers(activeDrivers);
      setVehicles(vehiclesData || []);

      // update global metadata context so detail page can access it
      updateMetadata({
        pickupLocations: pickup || [],
        hungerSpots: hunger || [],
        drivers: activeDrivers,
        vehicles: vehiclesData || [],
      });

      // enrich items by matching IDs against metadata
      const enriched = (data || []).map((o) => {
        // use opportunity_id directly from API
        const hsName = hunger.find((h) => h.id === o.hunger_spot_id)?.name || '';
        const plName = pickup.find((p) => p.id === o.donor_id)?.name || '';

        // title/description based on metadata and notes
        const title = plName || hsName || `Opportunity ${o.opportunity_id}`;
        const description = o.notes || (plName && hsName ? `${plName} → ${hsName}` : plName || hsName) || '';

        return {
          ...o,
          hungerSpotName: hsName,
          pickupLocationName: plName,
          driverName: activeDrivers.find((d) => d.id === o.driver_id)?.name || '',
          vehicleNumber: vehiclesData.find((v) => v.id === o.vehicle_id)?.number || '',
          name: title,
          description,
        };
      });
      setOpportunities(enriched);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...opportunities];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (opp) =>
          opp.name.toLowerCase().includes(q) ||
          opp.description.toLowerCase().includes(q) ||
          (opp.hungerSpotName || '').toLowerCase().includes(q)
      );
    }

    // Date filters
    if (fromDate) {
      const from = new Date(fromDate);
      list = list.filter((opp) => new Date(opp.createdAt || opp.created_at) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // End of day
      list = list.filter((opp) => new Date(opp.createdAt || opp.created_at) <= to);
    }

    // Status filter
    if (statusFilter) {
      list = list.filter((opp) => opp.status === statusFilter);
    }

    return list;
  }, [opportunities, searchQuery, fromDate, toDate, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, fromDate, toDate, statusFilter]);

  const handleEdit = (opportunity) => {
    // navigate to detail page (metadata is available via context)
    navigate(`/coordinator/review-opportunities/${opportunity.opportunity_id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <div className="text-lg text-gray-600">Loading opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Review Opportunities</h1>
        <p className="text-sm md:text-base text-gray-600 mb-4">Review and manage submitted opportunities</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search opportunities..."
            className="w-full sm:flex-1 sm:min-w-[120px]"
          />

          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <Button
            onClick={() => {
              setSearchQuery('');
              setFromDate('');
              setToDate('');
              setStatusFilter('');
            }}
            variant="secondary"
            className="w-full sm:w-auto shrink-0"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {paginated.map((opportunity) => (
          <TileCard
            key={opportunity.opportunity_id}
            title={opportunity.name || 'Unnamed Opportunity'}
            status={opportunity.status}
            fields={[
              { label: 'Description', value: opportunity.description || 'No description' },
              { label: 'Hunger Spot', value: opportunity.hungerSpotName || 'Unknown' },
              { label: 'Created', value: new Date(opportunity.created_at).toLocaleDateString() }
            ]}
            onEdit={() => handleEdit(opportunity)}
          />
        ))}
      </div>

      {paginated.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No opportunities found matching your criteria.
        </div>
      )}

      {/* Pagination */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="mt-8">
          <Pagination
            totalItems={filtered.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
};