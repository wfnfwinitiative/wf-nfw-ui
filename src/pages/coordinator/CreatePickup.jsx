import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HungerSpotApi } from '../../services/api/hungerSpotService';
import { ArrowLeft, CheckCircle, Phone } from 'lucide-react';
import { Card, CardBody, CardHeader, Input, Select, Textarea, Button } from '../../components/common';
import { DonorApi } from '../../services/api/donorService';
import { UserApi } from '../../services/api/userService';
import { VehicleApi } from '../../services/api/vehicleService';
import { opportunityApi } from '../../services/api/oppurtunityService';
import { DRIVER } from '../../constants';
import { useReviewOpportunitiesMetadata } from '../../contexts/ReviewOpportunitiesContext';
import { useAuth } from '../../auth/AuthContext';

export const CreatePickup = () => {
  const navigate = useNavigate();
  const { metadata, updateMetadata } = useReviewOpportunitiesMetadata();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use metadata from context
  const pickupLocations = (metadata?.pickupLocations || []).filter(d => d.isActive !== false);
  const hungerSpots = (metadata?.hungerSpots || []).filter(h => h.is_active !== false);
  const drivers = (metadata?.drivers || []).filter(d => d.status === 'active');
  const vehicles = (metadata?.vehicles || []).filter(v => v.is_active !== false);

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const currentDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [formData, setFormData] = useState({
    pickupLocationId: '',
    hungerSpotId: '',
    driverId: '',
    pickupEta: currentDateTime,
    deliveryBy: currentDateTime,
    estimatedQuantity: '',
    estimatedUnit: 'kg',
    vehicleId: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pickup, hunger, driversData, transportations] = await Promise.all([
        DonorApi.getDonors(),
        HungerSpotApi.getHungerSpot(),
        UserApi.getUserByRole(DRIVER),
        VehicleApi.getVehicles()
      ]);

      updateMetadata({
        pickupLocations: pickup || [],
        hungerSpots: hunger || [],
        drivers: (driversData || []).filter((d) => d.status === 'active'),
        vehicles: transportations || [],
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const transformToOpportunity = () => {
    const hasDriver = !!parseInt(formData.driverId);
    return {
      donor_id: parseInt(formData.pickupLocationId) || 0,
      hunger_spot_id: parseInt(formData.hungerSpotId) || 0,
      status_id: hasDriver ? 2 : 1, // 2=Assigned when driver is set, 1=Created otherwise
      driver_id: parseInt(formData.driverId) || 0,
      vehicle_id: parseInt(formData.vehicleId) || 0,
      estimated_count: parseInt(formData.estimatedQuantity) || 0,
      estimated_unit: formData.estimatedUnit,
      feeding_count: 0,
      pickup_eta: new Date(formData.pickupEta).toISOString(),
      delivery_by: new Date(formData.deliveryBy).toISOString(),
      notes: formData.notes || '',
      image_link: '',
      creator_id: user?.id, // Get creator_id from logged-in user
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    
    const opportunity = transformToOpportunity();

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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center p-8">
        <p className="text-gray-500">Loading form data...</p>
      </div>
    );
  }

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
      <Button onClick={() => navigate('/coordinator/dashboard')} variant="secondary" className="mb-6 text-ngo-gray hover:text-ngo-dark border-0 bg-transparent shadow-none" icon={ArrowLeft}>
        Back to Dashboard
      </Button>

      <Card className="rounded-2xl shadow-xl p-0 border border-gray-100">
        <CardBody className="p-8">
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
                <Select
                  label="Donor Location"
                  value={String(formData.pickupLocationId)}
                  onChange={(e) => setFormData({ ...formData, pickupLocationId: e.target.value })}
                  required
                  options={pickupLocations.map((loc) => ({ value: String(loc.id), label: loc.name }))}
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
                  value={String(formData.hungerSpotId)}
                  onChange={(e) => setFormData({ ...formData, hungerSpotId: e.target.value })}
                  required
                  options={hungerSpots.map((loc) => ({ value: String(loc.id), label: loc.name }))}
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

            <div>
              <Select
                label="Assign Vehicle"
                value={String(formData.vehicleId)}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                required
                options={vehicles.map((v) => ({ value: String(v.id), label: `${v.number} - ${v.notes || ''}` }))}
              />
            </div>

            <div>
              <Select
                label="Assign Driver"
                value={String(formData.driverId)}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                required
                options={drivers.map((d) => ({ value: String(d.id), label: `${d.name} - ${d.phone || ''}` }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Pickup ETA"
                type="datetime-local"
                value={formData.pickupEta}
                onChange={(e) => setFormData({ ...formData, pickupEta: e.target.value })}
                required
              />
              <Input
                label="Delivery ETA"
                type="datetime-local"
                value={formData.deliveryBy}
                onChange={(e) => setFormData({ ...formData, deliveryBy: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Quantity <span className="text-red-500">*</span></label>
              <div className="flex items-stretch border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ngo-orange">
                <input
                  type="tel"
                  value={formData.estimatedQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) setFormData({ ...formData, estimatedQuantity: val });
                  }}
                  placeholder="e.g. 50"
                  required
                  className="flex-1 px-4 py-3 outline-none bg-white text-gray-800"
                />
                <select
                  value={formData.estimatedUnit}
                  onChange={(e) => setFormData({ ...formData, estimatedUnit: e.target.value })}
                  className="px-3 py-3 bg-gray-50 border-l border-gray-300 text-gray-700 text-sm outline-none cursor-pointer"
                >
                  <option value="kg">kg of food</option>
                  <option value="people">no. of people</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any special instructions..."
            />

            <Button type="submit" variant="primary" className="w-full">
              Create Opportunity & Assign Driver
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
