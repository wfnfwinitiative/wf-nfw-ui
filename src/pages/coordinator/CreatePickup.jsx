import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../../services/mockApi';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CreatePickup = () => {
  const navigate = useNavigate();
  const [pickupLocations, setPickupLocations] = useState([]);
  const [hungerSpots, setHungerSpots] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocationId: '',
    hungerSpotId: '',
    driverId: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedQuantity: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pickup, hunger, driversData] = await Promise.all([
      mockApi.getLocations('pickup'),
      mockApi.getLocations('hungerspot'),
      mockApi.getDrivers()
    ]);
    setPickupLocations(pickup);
    setHungerSpots(hunger);
    setDrivers(driversData.filter(d => d.status === 'active'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const pickupLocation = pickupLocations.find(l => l.id === formData.pickupLocationId);
    const hungerSpot = hungerSpots.find(l => l.id === formData.hungerSpotId);
    const driver = drivers.find(d => d.id === formData.driverId);

    await mockApi.createPickup({
      ...formData,
      pickupLocationName: pickupLocation.name,
      hungerSpotName: hungerSpot.name,
      driverName: driver.name,
      status: 'ASSIGNED'
    });

    setSuccess(true);
    setTimeout(() => {
      navigate('/coordinator/dashboard');
    }, 2000);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-ngo-green" />
          </div>
          <h2 className="text-2xl font-bold text-ngo-dark mb-2">Pickup Created Successfully!</h2>
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
        <h1 className="text-3xl font-bold text-ngo-dark mb-2">Create New Pickup</h1>
        <p className="text-ngo-gray mb-8">Schedule a food rescue operation</p>

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
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">Scheduled Time</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
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
            Create Pickup & Assign Driver
          </Button>
        </form>
      </div>
    </div>
  );
};
