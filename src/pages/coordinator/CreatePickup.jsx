import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../../services/mockApi';
import { hungerSpotApi } from '../../services/api/hungerSpotService';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { donorApi } from '../../services/api/donorService';
import { UserApi } from '../../services/api/userService';
import { VehicleApi } from '../../services/api/vehicleService';
import { opportunityApi } from '../../services/api/oppurtunityService';

export const CreatePickup = () => {
  const navigate = useNavigate();
  const [pickupLocations, setPickupLocations] = useState([]);
  const [hungerSpots, setHungerSpots] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with current timestamp
  const now = new Date();
  const currentDateTime = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"

  const [formData, setFormData] = useState({
    pickupLocationId: '',
    hungerSpotId: '',
    driverId: '',
    scheduledDateTime: currentDateTime,
    estimatedQuantity: '',
    vehicleId: '',
    notes: ''
  });

  // Helper to update just the date part
  const updateScheduledDate = (newDate) => {
    const [, time] = formData.scheduledDateTime.split('T');
    setFormData({ ...formData, scheduledDateTime: `${newDate}T${time}` });
  };

  // Helper to update just the time part
  const updateScheduledTime = (newTime) => {
    const [date] = formData.scheduledDateTime.split('T');
    setFormData({ ...formData, scheduledDateTime: `${date}T${newTime}` });
  };

  useEffect(() => {
    console.log('Pre-loading')
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('===')
      const [pickup, hunger, driversData, tranportations] = await Promise.all([
        donorApi.getDonors(),
        hungerSpotApi.getHungerSpot(),
        UserApi.getDrivers(),
        VehicleApi.getVehicles()
      ]);
      console.log(hunger)
      setPickupLocations(pickup || []);
      setHungerSpots(hunger || []);
      setVehicles(tranportations);
      setDrivers((driversData || []).filter(d => d.status === 'active'));
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    }
  };

  const transformToOpportunity = () => {
    return {
      donor_id: parseInt(formData.pickupLocationId) || 0,
      hunger_spot_id: parseInt(formData.hungerSpotId) || 0,
      status_id: 1, // Default status for new opportunity
      driver_id: parseInt(formData.driverId) || 0,
      vehicle_id: parseInt(formData.vehicleId) || 0,
      feeding_count: parseInt(formData.estimatedQuantity) || 0,
      pickup_eta: new Date(formData.scheduledDateTime).toISOString(),
      delivery_by: new Date(formData.scheduledDateTime).toISOString(),
      notes: formData.notes || '',
      image_link: ''
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const opportunity = transformToOpportunity();
    console.log(opportunity)

    try {
      await opportunityApi.createOpportunity(opportunity);
      setSuccess(true);
      setTimeout(() => {
        navigate('/coordinator/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating opportunity:', err);
      setError('Failed to create opportunity. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-ngo-green" />
          </div>
          <h2 className="text-2xl font-bold text-ngo-dark mb-2">Opportunity Created Successfully!</h2>
          <p className="text-ngo-gray">Driver has been notified. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button onClick={() => navigate('/coordinator/dashboard')} variant="secondary" className="mb-6 text-ngo-gray hover:text-ngo-dark border-0 bg-transparent shadow-none">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-ngo-dark mb-2">Create New Opportunity</h1>
        <p className="text-ngo-gray mb-8">Schedule a food rescue operation</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-semibold">Error loading data:</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">Pickup Location</label>
              <select
                value={formData.pickupLocationId}
                onChange={(e) => setFormData({ ...formData, pickupLocationId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                required
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
                required
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
              required
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
              required
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">Scheduled Time</label>
              <input
                type="time"
                value={formData.scheduledDateTime.split('T')[1]}
                onChange={(e) => updateScheduledTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                required
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
              required
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

          <Button type="submit" variant="primary" fullWidth>
            Create Opportunity & Assign Driver
          </Button>
        </form>
      </div>
    </div>
  );
};
