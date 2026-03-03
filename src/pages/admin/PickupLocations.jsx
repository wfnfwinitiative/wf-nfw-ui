import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { ActionButtons } from '../../components/ActionButtons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { mockApi } from '../../services/mockApi';
import { LocationPicker } from '../../components/location/LocationPicker';
import { Plus, X } from 'lucide-react';

const emptyForm = { name: '', address: '', contact: '', lat: '', lng: '', type: 'pickup' };

export const PickupLocations = () => {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const data = await mockApi.getLocations('pickup');
    setLocations(data);
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      name: row.name ?? '',
      address: row.address ?? '',
      contact: row.contact ?? '',
      lat: row.lat ?? '',
      lng: row.lng ?? '',
      type: 'pickup'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await mockApi.updateLocation(editingId, formData);
    } else {
      await mockApi.addLocation(formData);
    }
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    loadLocations();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    await mockApi.deleteLocation(deleteConfirm.id);
    setDeleteConfirm({ open: false, id: null });
    loadLocations();
  };

  const columns = [
    { header: 'Location Name', field: 'name' },
    { header: 'Address', field: 'address' },
    { header: 'Contact', field: 'contact' },
    { header: 'Coordinates', render: (row) => `${row.lat}, ${row.lng}` },
    {
      header: 'Actions',
      render: (row) => (
        <ActionButtons onEdit={() => openEdit(row)} onDelete={() => setDeleteConfirm({ open: true, id: row.id })} editLabel="Edit" deleteLabel="Delete" />
      )
    }
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1 md:mb-2">Pickup Locations</h1>
          <p className="text-sm md:text-base text-ngo-gray">Manage food donor locations</p>
        </div>
        <div className="flex flex-row items-center justify-end gap-3 flex-wrap md:flex-nowrap">
          <Button onClick={openAdd} variant="primary">
            <Plus className="w-5 h-5" />
            Add Location
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-ngo-dark">{editingId ? 'Edit Pickup Location' : 'Add Pickup Location'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }} className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-ngo-light rounded-xl" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ngo-dark dark:text-gray-200 mb-2">Location Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Big Bazaar - Lajpat Nagar" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ngo-dark dark:text-gray-200 mb-2">Contact Number</label>
                <input type="tel" value={formData.contact} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d+$/.test(val)) setFormData({ ...formData, contact: val }); }} maxLength={10} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ngo-dark dark:text-gray-200 mb-2">Location (search or use current location)</label>
                <LocationPicker
                  value={{
                    address: formData.address,
                    latitude: formData.lat !== '' ? Number(formData.lat) : undefined,
                    longitude: formData.lng !== '' ? Number(formData.lng) : undefined
                  }}
                  onChange={(loc) => setFormData((prev) => ({
                    ...prev,
                    address: loc?.address ?? '',
                    lat: loc?.latitude != null ? String(loc.latitude) : '',
                    lng: loc?.longitude != null ? String(loc.longitude) : ''
                  }))}
                />
              </div>
              <Button type="submit" variant="primary" fullWidth disabled={!formData.address || formData.lat === '' || formData.lng === ''}>{editingId ? 'Update Location' : 'Add Location'}</Button>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal open={deleteConfirm.open} message="Are you sure you want to delete this record?" confirmLabel="Delete" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteConfirm({ open: false, id: null })} />

      <div className="overflow-x-auto">
        <DataTable columns={columns} data={locations} />
      </div>
    </div>
  );
};
