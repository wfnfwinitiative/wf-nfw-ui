import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { ActionButtons } from '../../components/ActionButtons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { mockApi } from '../../services/mockApi';
import { Plus, X } from 'lucide-react';

const emptyForm = { name: '', phone: '', licenseNumber: '', vehicleId: '' };

export const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [driversData, vehiclesData] = await Promise.all([mockApi.getDrivers(), mockApi.getVehicles()]);
    setDrivers(driversData);
    setVehicles(vehiclesData);
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
      phone: row.phone ?? '',
      licenseNumber: row.licenseNumber ?? '',
      vehicleId: row.vehicleId ?? ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await mockApi.updateDriver(editingId, formData);
    } else {
      await mockApi.addDriver(formData);
    }
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    await mockApi.deleteDriver(deleteConfirm.id);
    setDeleteConfirm({ open: false, id: null });
    loadData();
  };

  const columns = [
    { header: 'Name', field: 'name' },
    { header: 'Phone', field: 'phone' },
    { header: 'License Number', field: 'licenseNumber' },
    {
      header: 'Vehicle',
      render: (row) => {
        const vehicle = vehicles.find(v => v.id === row.vehicleId);
        return vehicle ? vehicle.number : 'N/A';
      }
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {row.status}
        </span>
      )
    },
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
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1 md:mb-2">Drivers</h1>
          <p className="text-sm md:text-base text-ngo-gray">Manage driver accounts and assignments</p>
        </div>
        <div className="flex flex-row items-center justify-end gap-3 flex-wrap md:flex-nowrap">
          <Button onClick={openAdd} variant="primary">
            <Plus className="w-5 h-5" />
            Add Driver
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-ngo-dark">{editingId ? 'Edit Driver' : 'Add Driver'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }} className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-ngo-light rounded-xl" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ngo-dark mb-2">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none text-sm md:text-base" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ngo-dark mb-2">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none text-sm md:text-base" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ngo-dark mb-2">License Number</label>
                <input type="text" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none text-sm md:text-base" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ngo-dark mb-2">Assign Vehicle</label>
                <select value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none text-sm md:text-base min-h-[44px]" required>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.number} - {vehicle.type}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="primary" fullWidth>{editingId ? 'Update Driver' : 'Add Driver'}</Button>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal open={deleteConfirm.open} message="Are you sure you want to delete this record?" confirmLabel="Delete" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteConfirm({ open: false, id: null })} />

      <div className="overflow-x-auto">
        <DataTable columns={columns} data={drivers} />
      </div>
    </div>
  );
};
