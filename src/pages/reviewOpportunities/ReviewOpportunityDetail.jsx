import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Select, Textarea } from '../../components/common';
import { ArrowLeft, X } from 'lucide-react';
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
  const { metadata, updateMetadata } = useReviewOpportunitiesMetadata();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const pickupLocations = metadata?.pickupLocations || [];
  const hungerSpots = metadata?.hungerSpots || [];
  const drivers = metadata?.drivers || [];
  const vehicles = metadata?.vehicles || [];
  const statusMap = metadata?.statusMap || {};
  const location = useLocation(); // access state passed via navigate


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

  useEffect(() => {
    loadData();
  }, [id, metadata]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make sure we have metadata; if not, fetch it and update context.
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

      // Set opportunity data
      setOpportunity(opp);
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
    return {
      donor_id: parseInt(formData.pickupLocationId) || opportunity.donor_id,
      hunger_spot_id: parseInt(formData.hungerSpotId) || opportunity.hunger_spot_id,
      status_id: parseInt(Object.keys(statusMap).find(key => statusMap[key] === 'Completed')) || opportunity.status_id,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading opportunity...</div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-ngo-dark mb-2">Review Opportunity</h1>
        <p className="text-ngo-gray mb-8">Review and update opportunity details</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Select
              label="Pickup Location"
              value={formData.pickupLocationId}
              onChange={(e) => setFormData({ ...formData, pickupLocationId: e.target.value })}
              options={pickupLocations.map((loc) => ({ value: loc.id, label: loc.name }))}
              placeholder="Select Pickup Location"
            />

            <Select
              label="Delivery Location"
              value={formData.hungerSpotId}
              onChange={(e) => setFormData({ ...formData, hungerSpotId: e.target.value })}
              options={hungerSpots.map((loc) => ({ value: loc.id, label: loc.name }))}
              placeholder="Select HungerSpot"
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
          />

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Scheduled Date"
              type="date"
              value={formData.scheduledDateTime.split('T')[0]}
              onChange={(e) => updateScheduledDate(e.target.value)}
            />

            <Input
              label="Scheduled Time"
              type="time"
              value={formData.scheduledDateTime.split('T')[1]}
              onChange={(e) => updateScheduledTime(e.target.value)}
            />
          </div>

          <Input
            label="Estimated Quantity"
            type="text"
            value={formData.estimatedQuantity}
            onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
            placeholder="e.g., 50 meals, 20kg"
          />
        </form>

        {/* Food Items Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-ngo-dark mb-4">Food Items Breakdown</h2>
          <FoodItemsGrid
            items={items}
            onItemsChange={handleItemsChange}
          />
        </div>

        {/* Notes Section */}
        <div className="mt-8">
          <Textarea
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Any special instructions..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button onClick={handleSave} variant="primary" disabled={saving} className="flex-1">
            {saving ? 'Saving...' : 'Complete Opportunity'}
          </Button>
          <Button onClick={handleClose} variant="secondary" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};