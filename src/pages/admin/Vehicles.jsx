import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchBar, SortDropdown, sortList } from '../../components/ui';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { TileCard } from '../../components/cards/TileCard';
import { validateVehicleNumber } from '../../utils/validation';
import { Plus, X, Loader2 } from 'lucide-react';
import { VehicleApi } from '../../services/api/vehicleService';

const emptyForm = { number: '', type: 'Van', capacity: '' };

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ number: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [activateConfirm, setActivateConfirm] = useState({ open: false, id: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    setPageError('');
    try {
      const data = await VehicleApi.getVehicles();
      const vehiclesData = data.map((v) => ({
        id: v.vehicle_id,
        number: v.vehicle_no,
        type: v.type || 'Van',
        capacity: v.notes || '',
        status: v.is_active ? 'active' : 'inactive',
      }));
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      const errorMessage =
        (error.response?.data?.detail && Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) ||
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'Failed to load vehicles.';
      setPageError(errorMessage);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const list = [...vehicles];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (v) =>
        (v.number || '').toLowerCase().includes(q) ||
        (v.type || '').toLowerCase().includes(q) ||
        (v.capacity || '').toLowerCase().includes(q) ||
        (v.status || '').toLowerCase().includes(q)
    );
  }, [vehicles, searchQuery]);

  const sorted = useMemo(
    () => {
      const list = sortList(filtered, sortBy, (v) => v.number || '', (v) => v.id || 0);
      return [...list.filter(v => v.status === 'active'), ...list.filter(v => v.status !== 'active')];
    },
    [filtered, sortBy]
  );

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [sorted, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError('');
    setFieldErrors({ number: '' });
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      number: row.number ?? '',
      type: row.type ?? 'Van',
      capacity: row.capacity ?? ''
    });
    setFormError('');
    setFieldErrors({ number: '' });
    setShowForm(true);
  };

  const getSubmitDisabled = () => {
    const numberResult = validateVehicleNumber(formData.number);
    if (!numberResult.valid) return true;
    if (!formData.capacity.trim()) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errors = { number: '' };
    const numberResult = validateVehicleNumber(formData.number);
    if (!numberResult.valid) errors.number = numberResult.message;
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    const payload = {
      vehicle_no: formData.number,
      notes: formData.capacity,
      type: formData.type,
    };

    try {
      if (editingId) {
        await VehicleApi.updateVehicle(editingId, payload);
        setSuccessMessage('Vehicle updated successfully.');
      } else {
        await VehicleApi.createVehicle(payload);
        setSuccessMessage('Vehicle created successfully.');
      }
      setTimeout(() => setSuccessMessage(''), 5000);

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadVehicles();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      const errorMessage =
        (error.response?.data?.detail && Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) ||
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while saving.';
      setFormError(errorMessage);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await VehicleApi.deleteVehicle(deleteConfirm.id);
      setSuccessMessage('Vehicle deactivated successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
      setDeleteConfirm({ open: false, id: null });
      loadVehicles();
    } catch (error) {
      console.error('Failed to deactivate vehicle:', error);
      const errorMessage =
        (error.response?.data?.detail && Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) ||
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while deactivating.';
      setPageError(errorMessage);
      setTimeout(() => setPageError(''), 5000);
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const handleActivateConfirm = async () => {
    if (!activateConfirm.id) return;
    try {
      const response = await VehicleApi.activateVehicle(activateConfirm.id);
      setSuccessMessage(typeof response?.message === 'string' ? response.message : 'Vehicle activated successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
      loadVehicles();
    } catch (error) {
      console.error('Failed to activate vehicle:', error);
      const errorMessage =
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while activating.';
      setPageError(errorMessage);
      setTimeout(() => setPageError(''), 5000);
    } finally {
      setActivateConfirm({ open: false, id: null });
    }
  };

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">
          Vehicles
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
          Manage delivery vehicle fleet
        </p>

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p>{successMessage}</p>
          </div>
        )}
        {pageError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{pageError}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by number, type or capacity…"
            className="w-full sm:flex-1 sm:min-w-[120px]"
          />
          <SortDropdown value={sortBy} onChange={setSortBy} placeholder="Sort by" />
          <Button onClick={openAdd} variant="primary" className="w-full sm:w-auto shrink-0">
            <Plus className="w-5 h-5" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {editingId ? 'Edit Vehicle' : 'Add Vehicle'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(emptyForm);
                  setFormError('');
                  setFieldErrors({ number: '' });
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {formError}
                </p>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[a-zA-Z0-9]*$/.test(val) && val.length <= 12)
                      setFormData({ ...formData, number: val });
                  }}
                  maxLength={12}
                  placeholder="e.g. AB12CD34"
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none ${fieldErrors.number ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {fieldErrors.number && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {fieldErrors.number}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                >
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Bike">Bike</option>
                  <option value="Auto">Auto</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Capacity
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="e.g., 500"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                  required
                />
              </div>

              <Button type="submit" variant="primary" fullWidth disabled={getSubmitDisabled()}>
                {editingId ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={deleteConfirm.open}
        message="Are you sure you want to deactivate this vehicle?"
        confirmLabel="Deactivate"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />

      <ConfirmationModal
        open={activateConfirm.open}
        message="Are you sure you want to activate this vehicle?"
        confirmLabel="Activate"
        onConfirm={handleActivateConfirm}
        onCancel={() => setActivateConfirm({ open: false, id: null })}
      />

      {loading ? (
        <div className="flex justify-center items-center p-16">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paginated.map((vehicle) => (
              <TileCard
                key={vehicle.id}
                title={vehicle.number}
                subtitle={vehicle.type}
                status={vehicle.status}
                fields={[{ label: 'Capacity', value: vehicle.capacity }]}
                onEdit={() => openEdit(vehicle)}
                onDelete={vehicle.status === 'active' ? () => setDeleteConfirm({ open: true, id: vehicle.id }) : undefined}
                onActivate={vehicle.status === 'inactive' ? () => setActivateConfirm({ open: true, id: vehicle.id }) : undefined}
                deleteLabel="Deactivate"
              />
            ))}
          </div>

          <div className="mt-6">
            <Pagination
              totalItems={sorted.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </>
      )}
    </div>
  );
};
