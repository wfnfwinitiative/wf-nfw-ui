import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchBar, SortDropdown, sortList } from '../../components/ui';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { mockApi } from '../../services/mockApi';
import { LocationPicker } from '../../components/location/LocationPicker';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { TileCard } from '../../components/cards/TileCard';
import { Plus, X } from 'lucide-react';

const emptyForm = {
  name: '',
  address: '',
  contactName: '',
  contactNumber: '',
  lat: '',
  lng: '',
  type: 'hungerspot'
};

const validateContactNumber = (value) => {
  if (!value || !String(value).trim()) return true;
  return /^\d{10}$/.test(String(value).trim());
};

export const HungerSpots = () => {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const data = await mockApi.getLocations('hungerspot');
    setLocations(data);
  };

  const filtered = useMemo(() => {
    const list = [...locations];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (l) =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.address || '').toLowerCase().includes(q) ||
        (l.contactName || '').toLowerCase().includes(q) ||
        (l.contactNumber || l.contact || '').toString().includes(q)
    );
  }, [locations, searchQuery]);

  const sorted = useMemo(
    () => sortList(filtered, sortBy, (l) => l.name || '', (l) => l.id || 0),
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
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      name: row.name ?? '',
      address: row.address ?? '',
      contactName: row.contactName ?? '',
      contactNumber: row.contactNumber ?? row.contact ?? '',
      lat: row.lat != null ? String(row.lat) : '',
      lng: row.lng != null ? String(row.lng) : '',
      type: 'hungerspot'
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validateContactNumber(formData.contactNumber)) {
      setFormError('Contact number must be 10 digits when provided.');
      return;
    }
    if (formData.lat === '' || formData.lng === '') {
      setFormError('Please provide latitude and longitude (select a location on the map or enter them manually).');
      return;
    }
    const payload = {
      ...formData,
      lat: formData.lat,
      lng: formData.lng,
      contact: formData.contactNumber || formData.contact
    };
    if (editingId) {
      await mockApi.updateLocation(editingId, payload);
    } else {
      await mockApi.addLocation(payload);
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

  const coordsStr = (lat, lng) => {
    if (lat == null && lng == null) return '—';
    return `${lat}, ${lng}`;
  };

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">
          HungerSpot Locations
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
          Manage food distribution centers
        </p>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, address or contact…"
            className="w-full sm:flex-1 sm:min-w-[120px]"
          />
          <SortDropdown value={sortBy} onChange={setSortBy} placeholder="Sort by" />
          <Button onClick={openAdd} variant="primary" className="w-full sm:w-auto shrink-0">
            <Plus className="w-5 h-5" />
            Add HungerSpot
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 my-4">
            <div className="flex items-center justify-between p-4 md:p-6 pb-3 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {editingId ? 'Edit HungerSpot' : 'Add HungerSpot'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(emptyForm);
                  setFormError('');
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200 shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6 pt-3">
              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {formError}
                </p>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rajeev Gandhi Ashram"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Contact Name <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Contact Number <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val))
                      setFormData({ ...formData, contactNumber: val });
                  }}
                  maxLength={10}
                  placeholder="10 digits"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Location (search or use current location — address and coordinates auto-fill)
                </label>
                <LocationPicker
                  value={{
                    address: formData.address,
                    latitude: formData.lat !== '' ? Number(formData.lat) : undefined,
                    longitude: formData.lng !== '' ? Number(formData.lng) : undefined
                  }}
                  onChange={(loc) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: loc?.address ?? '',
                      lat: loc?.latitude != null ? String(loc.latitude) : '',
                      lng: loc?.longitude != null ? String(loc.longitude) : ''
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="e.g., 28.5355"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Auto-fills when you select a location, or enter manually
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="e.g., 77.3910"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Auto-fills when you select a location, or enter manually
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={formData.lat === '' || formData.lng === ''}
              >
                {editingId ? 'Update HungerSpot' : 'Add HungerSpot'}
              </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={deleteConfirm.open}
        message="Are you sure you want to delete this record?"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {paginated.map((loc) => (
          <TileCard
            key={loc.id}
            title={loc.name || 'Unnamed HungerSpot'}
            fields={[
              { label: 'Address', value: loc.address },
              { label: 'Contact Name', value: loc.contactName },
              {
                label: 'Contact Number',
                value: loc.contactNumber || loc.contact
              },
              {
                label: 'Coordinates',
                value: coordsStr(loc.lat, loc.lng)
              }
            ]}
            onEdit={() => openEdit(loc)}
            onDelete={() => setDeleteConfirm({ open: true, id: loc.id })}
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
    </div>
  );
};
