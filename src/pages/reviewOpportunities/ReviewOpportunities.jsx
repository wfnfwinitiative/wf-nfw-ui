import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchBar } from '../../components/ui';
import { Button, Input, Select, Card, CardHeader, CardBody, StatusBadge } from '../../components/common';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { opportunityApi } from '../../services/api/oppurtunityService';
import { HungerSpotApi } from '../../services/api/hungerSpotService';
import { DonorApi } from '../../services/api/donorService';
import { UserApi } from '../../services/api/userService';
import { VehicleApi } from '../../services/api/vehicleService';
import { StatusApi } from '../../services/api/statusService.js';
import { useReviewOpportunitiesMetadata } from '../../contexts/ReviewOpportunitiesContext';
import { Spinner } from '../../components/common/Spinner';
import { Edit, Eye, RefreshCw, MapPin, Building2, User, Truck, Calendar, Phone } from 'lucide-react';

export const ReviewOpportunities = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-apply status filter when navigated from dashboard with ?status=xxx
  const initialStatus = new URLSearchParams(location.search).get('status') || 'all';
  const { metadata, updateMetadata } = useReviewOpportunitiesMetadata();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const oneMonthAgo = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  })();
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState(oneMonthAgo);
  const [toDate, setToDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Use metadata from context instead of local state
  const { pickupLocations, hungerSpots, drivers, vehicles, statuses, statusMap } = metadata;

  // Refetch every time the user navigates to this page (location.key changes on each visit)
  // Also re-apply any ?status= filter from the URL
  useEffect(() => {
    const status = new URLSearchParams(location.search).get('status') || 'all';
    setStatusFilter(status);
    loadOpportunities();
  }, [location.key]);

  const loadOpportunities = async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);

      // Check if we need to load metadata
      const needsMetadata = !pickupLocations.length || !hungerSpots.length || !drivers.length || !vehicles.length || !statuses.length;

      let metadataPromises = [];
      if (needsMetadata) {
        // Only load metadata if it's not already available
        metadataPromises = [
          DonorApi.getDonors(),
          HungerSpotApi.getHungerSpot(),
          UserApi.getUserByRole('DRIVER'),
          VehicleApi.getVehicles(),
          StatusApi.getStatuses(),
        ];
      }

      // Load opportunities and metadata in parallel (if needed)
      const promises = [opportunityApi.getOpportunities(), ...metadataPromises];
      const results = await Promise.all(promises);

      const opportunitiesData = results[0];
      let pickup = pickupLocations;
      let hunger = hungerSpots;
      let driversData = drivers;
      let vehiclesData = vehicles;
      let statusesData = statuses;

      if (needsMetadata) {
        [pickup, hunger, driversData, vehiclesData, statusesData] = results.slice(1);
        pickup = pickup || [];
        hunger = hunger || [];
        driversData = driversData || [];
        vehiclesData = vehiclesData || [];
        statusesData = statusesData || [];

        // Filter active drivers
        const activeDrivers = driversData.filter((d) => d.status === 'active');

        // Update global metadata context
        updateMetadata({
          pickupLocations: pickup,
          hungerSpots: hunger,
          drivers: activeDrivers,
          vehicles: vehiclesData,
          statuses: statusesData,
        });
      }

      // Compute current statusMap (use new data if fetched, else existing)
      const currentStatusMap = statusesData && Array.isArray(statusesData) ? statusesData.reduce((map, status) => {
        map[status.status_id] = status.status_name;
        return map;
      }, {}) : statusMap;

      // Enrich opportunities with metadata
      const enriched = (opportunitiesData || []).map((o) => {
        const hungerSpot = hunger.find((h) => h.id === o.hunger_spot_id || h.hunger_spot_id === o.hunger_spot_id);
        const donorSpot = pickup.find((p) => p.id === o.donor_id || p.donor_id === o.donor_id);
        const hsName = hungerSpot?.name || hungerSpot?.spot_name || hungerSpot?.hunger_spot_name || '';
        const plName = donorSpot?.name || donorSpot?.donor_name || '';

        const title = plName || hsName || `Opportunity ${o.opportunity_id}`;
        const description = o.notes || (plName && hsName ? `${plName} → ${hsName}` : plName || hsName) || '';

        const driver = drivers.find((d) => d.id === o.driver_id) || {};
        const vehicle = vehicles.find((v) => v.id === o.vehicle_id) || {};

        return {
          ...o,
          status: currentStatusMap[o.new_status_id || o.status_id] || o.status || 'Pending',
          hungerSpotName: hsName,
          pickupLocationName: plName,
          driverName: driver.name || '',
          driverPhone: driver.phone || '',
          vehicleNumber: vehicle.number || '',
          name: title,
          description,
        };
      });

      setOpportunities(enriched);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

    // Status filter - case insensitive
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((opp) => opp.status?.toLowerCase() === statusFilter.toLowerCase());
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

  const handleView = (opportunity) => {
    // navigate to detail page in view mode
    navigate(`/coordinator/review-opportunities/${opportunity.opportunity_id}?mode=view`);
  };

  const handleEdit = (opportunity) => {
    // navigate to detail page in edit mode
    navigate(`/coordinator/review-opportunities/${opportunity.opportunity_id}?mode=edit`);
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
        <div className="space-y-4 mb-6">
          {/* Search Bar - Full Width */}
          <div className="w-full">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search opportunities..."
              className="w-full"
            />
          </div>

          {/* Filter Controls - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="w-full">
              <Input
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="w-full">
              <Input
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="w-full">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  ...statuses.map((s) => ({ value: s.status_name, label: s.status_name })),
                ]}
                className="w-full"
              />
            </div>

            <div className="w-full flex items-end gap-2">
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFromDate('');
                  setToDate('');
                  setStatusFilter('all');
                }}
                variant="secondary"
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => loadOpportunities(true)}
                variant="outline"
                disabled={refreshing}
                className="shrink-0"
                title="Refresh status"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {paginated.map((opportunity) => (
        <Card key={opportunity.opportunity_id} className="h-full">
            <CardHeader className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
                  {opportunity.name || 'Unnamed Opportunity'}
                </h3>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ngo-orange flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {opportunity.pickupLocationName || opportunity.hungerSpotName || 'No location'}
                </p>
              </div>
              <StatusBadge status={opportunity.status} />
            </CardHeader>

            <CardBody className="space-y-2">
              {opportunity.description && (
                <p className="text-sm text-gray-600 line-clamp-2 italic">
                  {opportunity.description}
                </p>
              )}

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-500 shrink-0">Drop:</span>
                  <span className="truncate">{opportunity.hungerSpotName || 'Unknown'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-500 shrink-0">Driver:</span>
                  <span className="truncate">{opportunity.driverName || 'Unassigned'}</span>
                  {opportunity.driverPhone && (
                    <span className="text-gray-400 text-xs truncate flex items-center gap-1">
                      <Phone className="w-3 h-3" />{opportunity.driverPhone}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-500 shrink-0">Vehicle:</span>
                  <span className="truncate">{opportunity.vehicleNumber || 'Unassigned'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-500 shrink-0">Created:</span>
                  <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2 pt-1">
                <Button variant="secondary" className="flex-1" onClick={() => handleView(opportunity)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleEdit(opportunity)}
                  disabled={opportunity.status === 'Completed' || opportunity.status === 'completed' || ['inpickup', 'inpicked'].includes(opportunity.status?.toLowerCase())}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardBody>
          </Card>
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