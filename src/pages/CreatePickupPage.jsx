import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Package, Truck, Clock, Users, ArrowLeft, Building2 } from 'lucide-react';
import { Button, showToast } from '../components/common';
import { mockDonors, mockDrivers, mockVehiclesSchema, mockOpportunities, mockHungerSpotsSchema } from '../services/mockData';

export function CreatePickupPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form state matching schema
  const [formData, setFormData] = useState({
    donor_id: '',
    hunger_spot_id: '',
    driver_id: '',
    vehicle_id: '',
    feeding_count: '',
    pickup_eta: '',
    notes: '',
  });

  const [items, setItems] = useState([
    { id: 1, food_name: '', quality: 'Good', quantity_value: '', quantity_unit: 'kg' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (itemId, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now(),
      food_name: '',
      quality: 'Good',
      quantity_value: '',
      quantity_unit: 'kg'
    }]);
  };

  const removeItem = (itemId) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.donor_id) {
      showToast('Please select a donor', 'error');
      return;
    }

    if (!formData.hunger_spot_id) {
      showToast('Please select a hunger spot', 'error');
      return;
    }

    if (!formData.driver_id) {
      showToast('Please assign a driver', 'error');
      return;
    }

    const validItems = items.filter(item => item.food_name && item.quantity_value);
    if (validItems.length === 0) {
      showToast('Please add at least one food item', 'error');
      return;
    }

    setSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Build opportunity object matching schema
    const newOpportunity = {
      opportunity_id: mockOpportunities.length + 1,
      donor_id: parseInt(formData.donor_id),
      hunger_spot_id: formData.hunger_spot_id ? parseInt(formData.hunger_spot_id) : null,
      status_id: formData.driver_id ? 2 : 1, // assigned or created
      driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
      vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id) : null,
      creator_id: 2, // Current coordinator
      assignee_id: formData.driver_id ? parseInt(formData.driver_id) : null,
      feeding_count: parseInt(formData.feeding_count) || null,
      pickup_eta: formData.pickup_eta || null,
      notes: formData.notes || null,
      created_at: new Date().toISOString(),
      items: validItems.map((item, idx) => ({
        opportunity_item_id: Date.now() + idx,
        food_name: item.food_name,
        quality: item.quality,
        quantity_value: parseFloat(item.quantity_value),
        quantity_unit: item.quantity_unit,
      })),
    };

    console.log('Created pickup:', newOpportunity);
    showToast('Pickup created successfully!', 'success');
    setSubmitting(false);
    navigate('/pickups');
  };

  const selectedDonor = mockDonors.find(d => d.donor_id === parseInt(formData.donor_id));
  const selectedHungerSpot = mockHungerSpotsSchema.find(h => h.hunger_spot_id === parseInt(formData.hunger_spot_id));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Pickup</h1>
          <p className="text-gray-500">Create a new food pickup opportunity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donor Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Donor Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Donor *
              </label>
              <select
                name="donor_id"
                value={formData.donor_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Choose a donor...</option>
                {mockDonors.map(donor => (
                  <option key={donor.donor_id} value={donor.donor_id}>
                    {donor.donor_name} - {donor.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Show selected donor details */}
            {selectedDonor && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedDonor.donor_name}</p>
                <p className="text-sm text-gray-600">{selectedDonor.address}</p>
                <p className="text-sm text-gray-600">
                  Contact: {selectedDonor.contact_person} ({selectedDonor.mobile_number})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hunger Spot Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            Hunger Spot (Delivery Location) *
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Hunger Spot *
              </label>
              <select
                name="hunger_spot_id"
                value={formData.hunger_spot_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Choose a hunger spot...</option>
                {mockHungerSpotsSchema.map(spot => (
                  <option key={spot.hunger_spot_id} value={spot.hunger_spot_id}>
                    {spot.spot_name} - {spot.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Show selected hunger spot details */}
            {selectedHungerSpot && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedHungerSpot.spot_name}</p>
                <p className="text-sm text-gray-600">{selectedHungerSpot.address}</p>
                <p className="text-sm text-gray-600">
                  Contact: {selectedHungerSpot.contact_person} ({selectedHungerSpot.mobile_number})
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Capacity: {selectedHungerSpot.capacity_meals} meals
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Food Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Food Items
            </h2>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Food Name *
                    </label>
                    <input
                      type="text"
                      value={item.food_name}
                      onChange={(e) => handleItemChange(item.id, 'food_name', e.target.value)}
                      placeholder="e.g., Biryani, Idli"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Quantity *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={item.quantity_value}
                        onChange={(e) => handleItemChange(item.id, 'quantity_value', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        value={item.quantity_unit}
                        onChange={(e) => handleItemChange(item.id, 'quantity_unit', e.target.value)}
                        className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="kg">kg</option>
                        <option value="liters">liters</option>
                        <option value="pieces">pieces</option>
                        <option value="packets">packets</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Quality
                    </label>
                    <select
                      value={item.quality}
                      onChange={(e) => handleItemChange(item.id, 'quality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Driver Assignment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Driver Assignment *
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Driver *
              </label>
              <select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select driver...</option>
                {mockDrivers.map(driver => (
                  <option key={driver.user_id} value={driver.user_id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Vehicle
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select vehicle (optional)...</option>
                {mockVehiclesSchema.map(vehicle => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.vehicle_no} - {vehicle.notes}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Additional Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Estimated Feeding Count
                </span>
              </label>
              <input
                type="number"
                name="feeding_count"
                value={formData.feeding_count}
                onChange={handleInputChange}
                placeholder="Number of people to be fed"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup ETA
              </label>
              <input
                type="datetime-local"
                name="pickup_eta"
                value={formData.pickup_eta}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special instructions or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Pickup
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreatePickupPage;
