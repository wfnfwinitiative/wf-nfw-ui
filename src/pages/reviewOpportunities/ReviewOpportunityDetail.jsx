import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Select, Textarea, DriverTrackingMap, StatusBadge } from '../../components/common';
import { ArrowLeft, X, Navigation, Edit } from 'lucide-react';
import { opportunityApi } from '../../services/api/oppurtunityService';
import { FoodItemsGrid } from '../../pages/driver/FoodItemsGrid';
import { HungerSpotApi } from '../../services/api/hungerSpotService';
import { DonorApi } from '../../services/api/donorService';
import { UserApi } from '../../services/api/userService';
import { VehicleApi } from '../../services/api/vehicleService';
import { StatusApi } from '../../services/api/statusService';
import { useReviewOpportunitiesMetadata } from '../../contexts/ReviewOpportunitiesContext';
import { useAuth } from '../../auth/AuthContext';
import { DRIVER } from '../../constants';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useFeatureFlags, FEATURE_FLAGS } from '../../contexts/FeatureFlagsContext';

export const ReviewOpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationObj = useLocation();
  const { metadata, updateMetadata } = useReviewOpportunitiesMetadata();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [showTracking, setShowTracking] = useState(false);
  const { isFeatureEnabled } = useFeatureFlags();
  const driverTrackingFeatureEnabled = isFeatureEnabled(FEATURE_FLAGS.DRIVER_TRACKING);

  // Get mode from URL query parameters
  const searchParams = new URLSearchParams(locationObj.search);
  const mode = searchParams.get('mode') || 'edit'; // default to edit for backward compatibility

  const pickupLocations = metadata?.pickupLocations || [];
  const hungerSpots = metadata?.hungerSpots || [];
  const drivers = metadata?.drivers || [];
  const vehicles = metadata?.vehicles || [];
  const statusMap = metadata?.statusMap || {};

  const [formData, setFormData] = useState({
    pickupLocationId: '',
    hungerSpotId: '',
    driverId: '',
    vehicleId: '',
    scheduledDateTime: '',
    estimatedQuantity: '',
    notes: ''
  });

  // Helper to update just the date part
  const updateScheduledDate = (newDate) => {
    const [, time] = formData.scheduledDateTime.split('T');
    setFormData({ ...formData, scheduledDateTime: `${newDate}T${time || '00:00'}` });
  };

  // Helper to update just the time part
  const updateScheduledTime = (newTime) => {
    const [date] = formData.scheduledDateTime.split('T');
    setFormData({ ...formData, scheduledDateTime: `${date || new Date().toISOString().slice(0, 10)}T${newTime}` });
  };

  // --- Derived coords (must be above the tracking hook) ---
  const pickupCoords = (() => {
    const donor = pickupLocations.find((p) => p.id === parseInt(formData.pickupLocationId));
    if (!donor) return null;
    return { latitude: donor.latitude, longitude: donor.longitude, address: donor.address, name: donor.name };
  })();

  const deliveryCoords = (() => {
    const spot = hungerSpots.find((h) => h.id === parseInt(formData.hungerSpotId));
    if (!spot) return null;
    return { latitude: spot.latitude, longitude: spot.longitude, address: spot.address, name: spot.name };
  })();

  const assignedDriverName = (() => {
    const d = drivers.find((dr) => dr.id === parseInt(formData.driverId));
    return d?.name || 'Driver';
  })();

  // --- Live Driver Tracking ---
  const isInProgress = opportunity?.status?.toLowerCase() === 'inpickup' ||
                       opportunity?.status?.toLowerCase() === 'inpicked';
  const canShowTracking = driverTrackingFeatureEnabled && isInProgress && !!opportunity?.driver_id;
  const trackingEnabled = canShowTracking && showTracking;
  const { location: driverLocation, isMock, effectivePickup, effectiveDelivery } = useDriverLocation(
    opportunity?.opportunity_id,
    trackingEnabled,
    pickupCoords,
    deliveryCoords,
  );

  useEffect(() => {
    // Clear previous data when id changes
    setOpportunity(null);
    setItems([]);
    setFormData({
      pickupLocationId: '',
      hungerSpotId: '',
      driverId: '',
      vehicleId: '',
      scheduledDateTime: '',
      estimatedQuantity: '',
      notes: ''
    });
    setError(null);
    
    loadData();
  }, [id, metadata]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const hasAllMetadata = pickupLocations.length > 0 && hungerSpots.length > 0 &&
                            drivers.length > 0 && vehicles.length > 0 && Object.keys(statusMap).length > 0;

      if (!hasAllMetadata) {
        const fetched = await Promise.all([
          pickupLocations.length ? Promise.resolve(pickupLocations) : DonorApi.getDonors(),
          hungerSpots.length ? Promise.resolve(hungerSpots) : HungerSpotApi.getHungerSpot(),
          drivers.length ? Promise.resolve(drivers) : UserApi.getUserByRole(DRIVER),
          vehicles.length ? Promise.resolve(vehicles) : VehicleApi.getVehicles(),
          Object.keys(statusMap).length ? Promise.resolve([]) : StatusApi.getStatuses(),
        ]);

        const [pickup, hunger, driversData, vehiclesData, statusesData] = fetched;

        updateMetadata({
          pickupLocations: pickup || [],
          hungerSpots: hunger || [],
          drivers: (driversData || []).filter((d) => d.status === 'active'),
          vehicles: vehiclesData || [],
          statuses: statusesData || [],
        });
      }

      // Load opportunity details
      const opp = await opportunityApi.getOpportunityById(id);

      // Compute status using statusMap
      const computedStatus = statusMap[opp.new_status_id || opp.status_id] || opp.status || 'Pending';

      // Set opportunity data with computed status
      setOpportunity({ ...opp, status: computedStatus });
      setItems((opp.opportunity_items || []).map(item => ({
        id: item.opportunity_item_id,
        foodName: item.food_name,
        quantity: `${item.quantity_value} ${item.quantity_unit}`
      })));
      setFormData({
        pickupLocationId: opp.donor_id?.toString() || '',
        hungerSpotId: opp.hunger_spot_id?.toString() || '',
        driverId: opp.driver_id?.toString() || '',
        vehicleId: opp.vehicle_id?.toString() || '',
        scheduledDateTime: opp.pickup_eta ? new Date(opp.pickup_eta).toISOString().slice(0, 16) : '',
        estimatedQuantity: opp.feeding_count?.toString() || '',
        notes: opp.notes || '',
      });
    } catch (err) {
      console.error('Error loading opportunity details:', err);
      setError('Failed to load opportunity details');
    } finally {
      setLoading(false);
    }
  };

  const transformToOpportunity = () => {
    // Keep the current effective status; only promote Created → Assigned when a driver is set
    const effectiveStatusId = opportunity.new_status_id || opportunity.status_id;
    const assignedStatusId = 2; // DB: 'Assigned'
    // Promote Created (1) or Rejected (4) → Assigned when a driver is (re)assigned
    const newStatusId = ([1, 4].includes(effectiveStatusId) && formData.driverId) ? assignedStatusId : effectiveStatusId;

    return {
      donor_id: parseInt(formData.pickupLocationId) || opportunity.donor_id,
      hunger_spot_id: parseInt(formData.hungerSpotId) || opportunity.hunger_spot_id,
      status_id: newStatusId,
      driver_id: parseInt(formData.driverId) || opportunity.driver_id,
      vehicle_id: parseInt(formData.vehicleId) || opportunity.vehicle_id,
      feeding_count: parseInt(formData.estimatedQuantity) || opportunity.feeding_count,
      pickup_eta: new Date(formData.scheduledDateTime).toISOString(),
      delivery_by: new Date(formData.scheduledDateTime).toISOString(),
      notes: formData.notes || '',
      creator_id: user?.id, // Use logged-in user's ID instead of original creator
      image_link: opportunity.image_link || '',
      pickup_folder_id: opportunity.pickup_folder_id || null,
      delivery_folder_id: opportunity.delivery_folder_id || null,
      start_time: opportunity.start_time || null,
      end_time: opportunity.end_time || null,
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    
    try {
      setSaving(true);
      const updatedOpportunity = transformToOpportunity();
      await opportunityApi.updateOpportunity(id, updatedOpportunity);
      navigate('/coordinator/review-opportunities');
    } catch (err) {
      console.error('Error updating opportunity:', err);
      setError('Failed to update opportunity. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    navigate('/coordinator/review-opportunities');
  };

  const handleItemsChange = async (newItems) => {
    const prevItems = items;

    // Find added items (id not in prev)
    const added = newItems.filter(n => !prevItems.find(p => p.id === n.id));
    // Find deleted items (id in prev but not in new)
    const deleted = prevItems.filter(p => !newItems.find(n => n.id === p.id));
    // Find updated items (same id, different content)
    const updated = newItems.filter(n => {
      const prev = prevItems.find(p => p.id === n.id);
      return prev && (prev.foodName !== n.foodName || prev.quantity !== n.quantity);
    });

    try {
      // Handle adds
      for (const item of added) {
        const [value, unit] = item.quantity.split(' ');
        const response = await opportunityApi.addOpportunityItem(id, {
          food_name: item.foodName,
          quantity_value: parseFloat(value) || 0,
          quantity_unit: unit || 'unit'
        });
        // Update the item with real id
        item.id = response.opportunity_item_id || response.id || item.id;
      }

      // Handle updates
      for (const item of updated) {
        const [value, unit] = item.quantity.split(' ');
        await opportunityApi.updateOpportunityItem(item.id, {
          food_name: item.foodName,
          quantity_value: parseFloat(value) || 0,
          quantity_unit: unit || 'unit'
        });
      }

      // Handle deletes
      for (const item of deleted) {
        await opportunityApi.deleteOpportunityItem(item.id);
      }

      // Update local state
      setItems(newItems);
    } catch (error) {
      console.error('Error updating items:', error);
      setError('Failed to update items');
      // Revert to previous state on error
      setItems(prevItems);
    }
  };

  const isDelivered = opportunity?.status === 'Delivered' || opportunity?.status === 'delivered';
  const isCompleted = opportunity?.status === 'Completed' || opportunity?.status === 'completed';
  const isViewMode = mode === 'view';
  const isReadonly = isViewMode || isCompleted;
  const isLimitedEdit = !isViewMode && isDelivered && !isCompleted;
  
  // Hide food items section in edit mode for certain statuses
  const hideFoodItemsInEdit = !isViewMode && ['created', 'pending', 'inpicked', 'rejected'].includes(opportunity?.status?.toLowerCase());
  const showFoodItemsSection = !hideFoodItemsInEdit;

  if (error && !opportunity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/coordinator/review-opportunities')} variant="primary">
          Back to Opportunities
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button onClick={handleClose} variant="secondary" className="mb-6 text-ngo-gray hover:text-ngo-dark border-0 bg-transparent shadow-none">
        <ArrowLeft className="w-4 h-4" />
        Back to Review Opportunities
      </Button>

      {/* Live Driver Tracking Panel — shown at top when in-progress */}
      {canShowTracking && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-ngo-dark flex items-center gap-2">
                <Navigation className="w-5 h-5 text-ngo-orange" />
                Live Driver Tracking
                {isMock && (
                  <span className="text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full">
                    MOCK
                  </span>
                )}
              </h2>
              <p className="text-sm text-ngo-gray mt-0.5">
                {assignedDriverName} · updates every {isMock ? '3 s (simulated)' : '10 s'}
              </p>
            </div>
            <Button
              variant={showTracking ? 'secondary' : 'primary'}
              onClick={() => setShowTracking((v) => !v)}
            >
              {showTracking ? 'Hide Map' : 'Track Driver'}
            </Button>
          </div>

          {showTracking && (
            <DriverTrackingMap
              driverLocation={driverLocation}
              pickupLocation={pickupCoords || effectivePickup}
              deliveryLocation={deliveryCoords || effectiveDelivery}
              driverName={assignedDriverName}
              height="420px"
            />
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-ngo-dark">
              {isViewMode ? 'View Opportunity' : 'Review Opportunity'}
            </h1>
            {opportunity?.status && <StatusBadge status={opportunity.status} className="text-sm px-3 py-1.5" />}
          </div>
          {isViewMode && !isCompleted && !['inpickup', 'inpicked'].includes(opportunity?.status?.toLowerCase()) && (
            <Button 
              onClick={() => navigate(`/coordinator/review-opportunities/${id}?mode=edit`)} 
              variant="secondary"
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>
        <p className="text-ngo-gray mb-8">
          {isViewMode 
            ? 'View opportunity details (readonly)' 
            : isLimitedEdit 
              ? 'Review and update items, quantity, and comments only'
              : 'Review and update opportunity details'
          }
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Select
              label="Donor Location"
              value={formData.pickupLocationId}
              onChange={(e) => setFormData({ ...formData, pickupLocationId: e.target.value })}
              options={pickupLocations.map((loc) => ({ value: loc.id, label: loc.name }))}
              placeholder="Select Donor Location"
              disabled={isReadonly || isLimitedEdit}
            />

            <Select
              label="Hunger Spot"
              value={formData.hungerSpotId}
              onChange={(e) => setFormData({ ...formData, hungerSpotId: e.target.value })}
              options={hungerSpots.map((loc) => ({ value: loc.id, label: loc.name }))}
              placeholder="Select HungerSpot"
              disabled={isReadonly || isLimitedEdit}
            />
          </div>

          <Select
            label="Assign Vehicle"
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            options={vehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.number} - ${vehicle.notes}`,
            }))}
            placeholder="Select Vehicle"
            disabled={isReadonly || isLimitedEdit}
          />

          <Select
            label="Assign Driver"
            value={formData.driverId}
            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
            options={drivers.map((driver) => ({
              value: driver.id,
              label: `${driver.name} - ${driver.phone}`,
            }))}
            placeholder="Select Driver"
            disabled={isReadonly || isLimitedEdit}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Scheduled Date"
              type="date"
              value={formData.scheduledDateTime.split('T')[0]}
              onChange={(e) => updateScheduledDate(e.target.value)}
              disabled={isReadonly || isLimitedEdit}
            />

            <Input
              label="Scheduled Time"
              type="time"
              value={formData.scheduledDateTime.split('T')[1]}
              onChange={(e) => updateScheduledTime(e.target.value)}
              disabled={isReadonly || isLimitedEdit}
            />
          </div>

          <Input
            label="Estimated Quantity"
            type="text"
            value={formData.estimatedQuantity}
            onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
            placeholder="e.g., 50 meals, 20kg"
            disabled={isReadonly}
          />
        </form>

        {/* Food Items Section */}
        {showFoodItemsSection && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-ngo-dark mb-4">Food Items Breakdown</h2>
            <FoodItemsGrid
              items={items}
              onItemsChange={handleItemsChange}
              readonly={isReadonly}
            />
          </div>
        )}

        <div className="mt-8">
          <Textarea
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Any special instructions..."
            disabled={isReadonly}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          {!isViewMode && !isReadonly && (
            <Button onClick={handleSave} variant="primary" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : isDelivered ? 'Complete Opportunity' : 'Update Opportunity'}
            </Button>
          )}
          <Button onClick={handleClose} variant={isViewMode ? "primary" : "secondary"} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  );
};