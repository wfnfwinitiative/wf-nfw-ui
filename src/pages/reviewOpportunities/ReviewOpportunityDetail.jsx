import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Select, Textarea, StatusBadge } from '../../components/common';
import { ArrowLeft, X, Edit, Scale, Users, Phone } from 'lucide-react';
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
    pickupEta: '',
    deliveryBy: '',
    estimatedQuantity: '',
    estimatedUnit: 'kg',
    notes: ''
  });

  useEffect(() => {
    // Clear previous data when id changes
    setOpportunity(null);
    setItems([]);
    setFormData({
      pickupLocationId: '',
      hungerSpotId: '',
      driverId: '',
      vehicleId: '',
      pickupEta: '',
      deliveryBy: '',
      estimatedQuantity: '',
      estimatedUnit: 'kg',
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
        quantity: `${item.quantity_value}`
      })));
      setFormData({
        pickupLocationId: opp.donor_id?.toString() || '',
        hungerSpotId: opp.hunger_spot_id?.toString() || '',
        driverId: opp.driver_id?.toString() || '',
        vehicleId: opp.vehicle_id?.toString() || '',
        pickupEta: opp.pickup_eta ? new Date(new Date(opp.pickup_eta).getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16) : '',
        deliveryBy: opp.delivery_by ? new Date(new Date(opp.delivery_by).getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16) : '',
        estimatedQuantity: opp.estimated_count?.toString() || '',
        estimatedUnit: opp.estimated_unit || 'kg',
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
    const effectiveStatusId = opportunity.new_status_id || opportunity.status_id;
    const assignedStatusId = 2;  // DB: 'Assigned'
    const completedStatusId = 7; // DB: 'Completed'

    let newStatusId;
    if (isDelivered) {
      newStatusId = completedStatusId; // Delivered → Completed
    } else if ([1, 4].includes(effectiveStatusId) && formData.driverId) {
      newStatusId = assignedStatusId;  // Created/Rejected → Assigned when driver set
    } else {
      newStatusId = effectiveStatusId;
    }

    return {
      donor_id: parseInt(formData.pickupLocationId) || opportunity.donor_id,
      hunger_spot_id: parseInt(formData.hungerSpotId) || opportunity.hunger_spot_id,
      status_id: newStatusId,
      driver_id: parseInt(formData.driverId) || opportunity.driver_id,
      vehicle_id: parseInt(formData.vehicleId) || opportunity.vehicle_id,
      estimated_count: parseInt(formData.estimatedQuantity) || opportunity.estimated_count,
      estimated_unit: formData.estimatedUnit,
      pickup_eta: new Date(new Date(formData.pickupEta).getTime() - 5.5 * 60 * 60 * 1000).toISOString(),
      delivery_by: new Date(new Date(formData.deliveryBy).getTime() - 5.5 * 60 * 60 * 1000).toISOString(),
      notes: formData.notes || '',
      creator_id: user?.id, // Use logged-in user's ID instead of original creator
      image_link: opportunity.image_link || '',
      pickup_folder_id: opportunity.pickup_folder_id || null,
      delivery_folder_id: opportunity.delivery_folder_id || null,
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
        });
        // Update the item with real id
        item.id = response.opportunity_item_id || response.id || item.id;
      }

      // Handle updates
      for (const item of updated) {
        const [value, unit] = item.quantity.split(' ');
        await opportunityApi.updateOpportunityItem(item.id, {
           opportunity_item_id: item.id,
           food_name: item.foodName,
           quantity_value: parseFloat(value) || 0,
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
            <div>
              <Select
                label="Donor Location"
                value={formData.pickupLocationId}
                onChange={(e) => setFormData({ ...formData, pickupLocationId: e.target.value })}
                options={pickupLocations.map((loc) => ({ value: loc.id, label: loc.name }))}
                placeholder="Select Donor Location"
                disabled={isReadonly || isLimitedEdit}
              />
              {(() => {
                const loc = pickupLocations.find(l => String(l.id) === String(formData.pickupLocationId));
                return loc ? (
                  <div className="mt-1.5 px-1 space-y-0.5">
                    {loc.address && <p className="text-xs text-gray-500">{loc.address}</p>}
                    {loc.phone && (
                      <a href={`tel:${loc.phone}`} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />{loc.phone}
                      </a>
                    )}
                  </div>
                ) : null;
              })()}
            </div>

            <div>
              <Select
                label="Hunger Spot"
                value={formData.hungerSpotId}
                onChange={(e) => setFormData({ ...formData, hungerSpotId: e.target.value })}
                options={hungerSpots.map((loc) => ({ value: loc.id, label: loc.name }))}
                placeholder="Select HungerSpot"
                disabled={isReadonly || isLimitedEdit}
              />
              {(() => {
                const loc = hungerSpots.find(h => String(h.id) === String(formData.hungerSpotId));
                return loc ? (
                  <div className="mt-1.5 px-1 space-y-0.5">
                    {loc.address && <p className="text-xs text-gray-500">{loc.address}</p>}
                    {loc.phone && (
                      <a href={`tel:${loc.phone}`} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />{loc.phone}
                      </a>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
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
              label="Pickup ETA"
              type="datetime-local"
              value={formData.pickupEta}
              onChange={(e) => setFormData({ ...formData, pickupEta: e.target.value })}
              disabled={isReadonly || isLimitedEdit}
            />
            <Input
              label="Delivery ETA"
              type="datetime-local"
              value={formData.deliveryBy}
              onChange={(e) => setFormData({ ...formData, deliveryBy: e.target.value })}
              disabled={isReadonly || isLimitedEdit}
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Quantity</label>
            <div className={`flex items-stretch border border-gray-300 rounded-xl overflow-hidden ${!isReadonly ? 'focus-within:ring-2 focus-within:ring-ngo-orange' : 'bg-gray-50 opacity-75'}`}>
              <input
                type="tel"
                value={formData.estimatedQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) setFormData({ ...formData, estimatedQuantity: val });
                }}
                placeholder="e.g. 50"
                disabled={isReadonly}
                className="flex-1 px-4 py-3 outline-none bg-transparent text-gray-800 disabled:cursor-not-allowed"
              />
              <select
                value={formData.estimatedUnit}
                onChange={(e) => setFormData({ ...formData, estimatedUnit: e.target.value })}
                disabled={isReadonly}
                className="px-3 py-3 bg-gray-50 border-l border-gray-300 text-gray-700 text-sm outline-none cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="kg">kg of food</option>
                <option value="people">no. of people</option>
              </select>
            </div>
          </div>
        </form>

        {/* Food Collected & People Fed — shown only for delivered/completed */}
        {(isDelivered || isCompleted) && (
          <div className="mt-8 flex items-center gap-3">
            {opportunity?.food_collected != null && (
              <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Scale className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="text-sm text-gray-700 font-medium">
                  Food Collected: {opportunity.food_collected} kg
                </span>
              </div>
            )}
            {opportunity?.feeding_count != null && (
              <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Users className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="text-sm text-gray-700 font-medium">
                  People Fed: {opportunity.feeding_count}
                </span>
              </div>
            )}
          </div>
        )}

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