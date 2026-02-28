import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, User, Truck, Clock, Filter, Search, Edit2, Save, X, Check } from 'lucide-react';
import { Button, StatusBadge, Modal, showToast } from '../components/common';
import { mockOpportunities, mockStatuses, mockDrivers, mockVehiclesSchema, mockHungerSpotsSchema } from '../services/mockData';

const STATUS_COLORS = {
  created: 'gray',
  assigned: 'blue',
  picked_up: 'amber',
  delivered: 'green',
  verified: 'purple',
  cancelled: 'red',
};

export function PickupsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pickups, setPickups] = useState(mockOpportunities);
  const [editingPickup, setEditingPickup] = useState(null);

  // Filter pickups
  const filteredPickups = pickups.filter(pickup => {
    const matchesSearch = 
      pickup.donor?.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pickup.status?.status_name === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (statusName) => STATUS_COLORS[statusName] || 'gray';

  const handleAssignDriver = (opportunityId, driverId, vehicleId) => {
    setPickups(prev => prev.map(pickup => {
      if (pickup.opportunity_id === opportunityId) {
        const driver = mockDrivers.find(d => d.user_id === parseInt(driverId));
        return {
          ...pickup,
          driver_id: parseInt(driverId),
          vehicle_id: vehicleId ? parseInt(vehicleId) : null,
          driver: driver,
          status_id: 2,
          status: { status_id: 2, status_name: 'assigned' },
        };
      }
      return pickup;
    }));
  };

  const handleEditPickup = (pickup) => {
    setEditingPickup({ ...pickup, items: pickup.items?.map(item => ({ ...item })) || [] });
  };

  const handleSavePickup = (updatedPickup) => {
    setPickups(prev => prev.map(pickup => 
      pickup.opportunity_id === updatedPickup.opportunity_id ? updatedPickup : pickup
    ));
    setEditingPickup(null);
    showToast('Pickup updated successfully!', 'success');
  };

  const handleVerifyPickup = (opportunityId) => {
    setPickups(prev => prev.map(pickup => {
      if (pickup.opportunity_id === opportunityId) {
        return {
          ...pickup,
          status_id: 5,
          status: { status_id: 5, status_name: 'verified' },
        };
      }
      return pickup;
    }));
    showToast('Pickup verified!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pickups</h1>
          <p className="text-gray-500">Manage food pickup opportunities</p>
        </div>
        <Button onClick={() => navigate('/pickups/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Pickup
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by donor or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              {mockStatuses.map(status => (
                <option key={status.status_id} value={status.status_name}>
                  {status.status_name.charAt(0).toUpperCase() + status.status_name.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pickups List */}
      <div className="space-y-4">
        {filteredPickups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pickups found</p>
          </div>
        ) : (
          filteredPickups.map(pickup => (
            <PickupCard
              key={pickup.opportunity_id}
              pickup={pickup}
              onAssign={handleAssignDriver}
              onEdit={handleEditPickup}
              onVerify={handleVerifyPickup}
            />
          ))
        )}
      </div>

      {/* Edit Pickup Modal */}
      {editingPickup && (
        <EditPickupModal
          pickup={editingPickup}
          onSave={handleSavePickup}
          onClose={() => setEditingPickup(null)}
        />
      )}
    </div>
  );
}

function PickupCard({ pickup, onAssign, onEdit, onVerify }) {
  const [showAssign, setShowAssign] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const statusColors = {
    created: 'bg-gray-100 text-gray-700',
    assigned: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
    verified: 'bg-purple-100 text-purple-700',
  };

  const handleAssign = () => {
    if (selectedDriver) {
      onAssign(pickup.opportunity_id, selectedDriver, selectedVehicle);
      setShowAssign(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEdit = ['delivered', 'picked_up'].includes(pickup.status?.status_name);
  const canVerify = pickup.status?.status_name === 'delivered';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {pickup.donor?.donor_name || 'Unknown Donor'}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[pickup.status?.status_name] || statusColors.created}`}>
              {pickup.status?.status_name?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-3">
            {pickup.donor?.address}
          </p>

          {/* Items */}
          <div className="flex flex-wrap gap-2 mb-3">
            {pickup.items?.map(item => (
              <span
                key={item.opportunity_item_id}
                className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
              >
                {item.food_name}: {item.quantity_value} {item.quantity_unit}
              </span>
            ))}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(pickup.pickup_eta)}
            </span>
            {pickup.feeding_count && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                ~{pickup.feeding_count} people
              </span>
            )}
            {pickup.driver && (
              <span className="flex items-center gap-1 text-blue-600">
                <Truck className="w-4 h-4" />
                {pickup.driver.name}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!pickup.driver_id && pickup.status?.status_name === 'created' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowAssign(!showAssign)}
            >
              Assign Driver
            </Button>
          )}
          {canEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(pickup)}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          {canVerify && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onVerify(pickup.opportunity_id)}
            >
              <Check className="w-4 h-4 mr-1" />
              Verify
            </Button>
          )}
        </div>
      </div>

      {/* Assign Driver Panel */}
      {showAssign && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select driver...</option>
              {mockDrivers.map(driver => (
                <option key={driver.user_id} value={driver.user_id}>
                  {driver.name}
                </option>
              ))}
            </select>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select vehicle...</option>
              {mockVehiclesSchema.map(vehicle => (
                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                  {vehicle.vehicle_no}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleAssign} disabled={!selectedDriver}>
              Assign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Pickup Modal Component
function EditPickupModal({ pickup, onSave, onClose }) {
  const [editedPickup, setEditedPickup] = useState(pickup);
  const [editedItems, setEditedItems] = useState(pickup.items || []);

  const handleItemChange = (index, field, value) => {
    setEditedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: field === 'quantity_value' ? parseFloat(value) || 0 : value } : item
    ));
  };

  const handleAddItem = () => {
    setEditedItems(prev => [
      ...prev,
      {
        opportunity_item_id: Date.now(),
        food_name: '',
        quality: 'Good',
        quantity_value: 0,
        quantity_unit: 'kg',
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setEditedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      ...editedPickup,
      items: editedItems,
      feeding_count: editedPickup.feeding_count,
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Pickup Details" size="lg">
      <div className="space-y-6">
        {/* Donor Info (Read-only) */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-500">Donor</p>
          <p className="text-gray-900">{editedPickup.donor?.donor_name}</p>
          <p className="text-sm text-gray-500">{editedPickup.donor?.address}</p>
        </div>

        {/* Hunger Spot (Read-only) */}
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-600">Deliver To</p>
          <p className="text-gray-900">{editedPickup.hunger_spot?.spot_name}</p>
          <p className="text-sm text-gray-500">{editedPickup.hunger_spot?.address}</p>
        </div>

        {/* Feeding Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Feeding Count
          </label>
          <input
            type="number"
            value={editedPickup.feeding_count || ''}
            onChange={(e) => setEditedPickup(prev => ({ ...prev, feeding_count: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Number of people"
          />
        </div>

        {/* Food Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Food Items
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-3">
            {editedItems.map((item, index) => (
              <div key={item.opportunity_item_id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.food_name}
                    onChange={(e) => handleItemChange(index, 'food_name', e.target.value)}
                    placeholder="Food name"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    value={item.quantity_value}
                    onChange={(e) => handleItemChange(index, 'quantity_value', e.target.value)}
                    placeholder="Qty"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="w-20">
                  <select
                    value={item.quantity_unit}
                    onChange={(e) => handleItemChange(index, 'quantity_unit', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="pieces">pieces</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
                <div className="w-24">
                  <select
                    value={item.quality}
                    onChange={(e) => handleItemChange(index, 'quality', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="Fresh">Fresh</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={editedPickup.notes || ''}
            onChange={(e) => setEditedPickup(prev => ({ ...prev, notes: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PickupsPage;
