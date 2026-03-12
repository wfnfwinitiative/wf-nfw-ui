import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, X } from 'lucide-react';
import { opportunityApi } from '../../services/api/oppurtunityService';
import { hungerSpotApi } from '../../services/api/hungerSpotService';
import { donorApi } from '../../services/api/donorService';
import { UserApi } from '../../services/api/userService';
import { VehicleApi } from '../../services/api/vehicleService';
import { useReviewOpportunitiesMetadata } from '../../contexts/ReviewOpportunitiesContext';
import { DRIVER } from '../../constants';

export const ReviewOpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { metadata } = useReviewOpportunitiesMetadata();
  const [opportunity, setOpportunity] = useState(null);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [hungerSpots, setHungerSpots] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
    // use metadata from context if available
    if (metadata?.pickupLocations?.length > 0) {
      setPickupLocations(metadata.pickupLocations);
    }
    if (metadata?.hungerSpots?.length > 0) {
      setHungerSpots(metadata.hungerSpots);
    }
    if (metadata?.drivers?.length > 0) {
      setDrivers(metadata.drivers);
    }
    if (metadata?.vehicles?.length > 0) {
      setVehicles(metadata.vehicles);
    }

    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dropdown data if not already available via navigation state
      let pickup = pickupLocations,
        hunger = hungerSpots,
        driversData = drivers,
        vehiclesData = vehicles;

      if (!pickup.length || !hunger.length || !driversData.length || !vehiclesData.length) {
        const results = await Promise.all([
          donorApi.getDonors(),
          hungerSpotApi.getHungerSpot(),
          UserApi.getUserByRole(DRIVER),
          VehicleApi.getVehicles(),
        ]);
        pickup = results[0] || [];
        hunger = results[1] || [];
        driversData = (results[2] || []).filter((d) => d.status === 'active');
        vehiclesData = results[3] || [];

        setPickupLocations(pickup);
        setHungerSpots(hunger);
        setDrivers(driversData);
        setVehicles(vehiclesData);
      }

      // Load opportunity details by id
      const opp = await opportunityApi.getOpportunityById(id);

      if (opp) {
        setOpportunity(opp);
        // Prepopulate form data (handle nested objects and id fields)
        const scheduledDateTime = opp.pickup_eta || opp.delivery_by || new Date().toISOString().slice(0, 16);
        setFormData({
          pickupLocationId:
            (opp.donor_id || opp.donor?.id || opp.pickupLocationId || '')?.toString(),
          hungerSpotId:
            (opp.hunger_spot_id || opp.hunger_spot?.id || opp.hungerSpotId || '')?.toString(),
          driverId:
            (opp.driver_id || opp.driver?.id || opp.driverId || '')?.toString(),
          vehicleId:
            (opp.vehicle_id || opp.vehicle?.id || opp.vehicleId || '')?.toString(),
          scheduledDateTime: scheduledDateTime,
          estimatedQuantity: (opp.feeding_count || opp.estimatedQuantity || '')?.toString(),
          notes: opp.notes || ''
        });
      } else {
        setError('Opportunity not found');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const transformToOpportunity = () => {
    return {
      donor_id: parseInt(formData.pickupLocationId) || opportunity.donor_id,
      hunger_spot_id: parseInt(formData.hungerSpotId) || opportunity.hunger_spot_id,
      status_id: opportunity.status_id || 1,
      driver_id: parseInt(formData.driverId) || opportunity.driver_id,
      vehicle_id: parseInt(formData.vehicleId) || opportunity.vehicle_id,
      feeding_count: parseInt(formData.estimatedQuantity) || opportunity.feeding_count,
      pickup_eta: new Date(formData.scheduledDateTime).toISOString(),
      delivery_by: new Date(formData.scheduledDateTime).toISOString(),
      notes: formData.notes || '',
      image_link: opportunity.image_link || '',
      creator_id: opportunity.creator_id || 2,
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedOpportunity = transformToOpportunity();
      // TODO: Implement update API call
      // await opportunityApi.updateOpportunity(id, updatedOpportunity);
      console.log('Updating opportunity:', updatedOpportunity);
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
            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">Pickup Location</label>
              <select
                value={formData.pickupLocationId}
                onChange={(e) => setFormData({ ...formData, pickupLocationId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
              >
                <option value="">Select Pickup Location</option>
                {pickupLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">Delivery Location</label>
              <select
                value={formData.hungerSpotId}
                onChange={(e) => setFormData({ ...formData, hungerSpotId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
              >
                <option value="">Select HungerSpot</option>
                {hungerSpots.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ngo-dark mb-2">Assign Vehicle</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.number} - {vehicle.notes}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ngo-dark mb-2">Assign Driver</label>
            <select
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
            >
              <option value="">Select Driver</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduledDateTime.split('T')[0]}
                onChange={(e) => updateScheduledDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">Scheduled Time</label>
              <input
                type="time"
                value={formData.scheduledDateTime.split('T')[1]}
                onChange={(e) => updateScheduledTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ngo-dark mb-2">Estimated Quantity</label>
            <input
              type="text"
              value={formData.estimatedQuantity}
              onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
              placeholder="e.g., 50 meals, 20kg"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ngo-dark mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
              rows="3"
              placeholder="Any special instructions..."
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" onClick={handleClose} variant="secondary" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};