import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchBar, SortDropdown, sortList } from '../../components/ui';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { mockApi } from '../../services/mockApi';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { TileCard } from '../../components/cards/TileCard';
import { validatePassword, validatePhone } from '../../utils/validation';
import { Plus, X } from 'lucide-react';

const emptyForm = { name: '', phone: '', password: '' };

export const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({ name: '', phone: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await mockApi.getDrivers();
    setDrivers(data);
  };

  const filtered = useMemo(() => {
    const list = [...drivers];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (d) =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.phone || '').toString().includes(q) ||
        (d.status || '').toLowerCase().includes(q)
    );
  }, [drivers, searchQuery]);

  const sorted = useMemo(
    () => sortList(filtered, sortBy, (d) => d.name || '', (d) => d.id || 0),
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
    setFieldErrors({ name: '', phone: '', password: '' });
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      name: row.name ?? '',
      phone: row.phone ?? '',
      password: ''
    });
    setFieldErrors({ name: '', phone: '', password: '' });
    setShowForm(true);
  };

  const getSubmitDisabled = () => {
    if (!formData.name.trim()) return true;
    const phoneResult = validatePhone(formData.phone, true);
    if (!phoneResult.valid) return true;
    if (!editingId) {
      const pwdResult = validatePassword(formData.password);
      if (!pwdResult.valid) return true;
    } else if (formData.password) {
      const pwdResult = validatePassword(formData.password);
      if (!pwdResult.valid) return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = { name: '', phone: '', password: '' };
    const phoneResult = validatePhone(formData.phone, true);
    if (!phoneResult.valid) errors.phone = phoneResult.message;
    if (!editingId) {
      const pwdResult = validatePassword(formData.password);
      if (!pwdResult.valid) errors.password = pwdResult.message;
    } else if (formData.password) {
      const pwdResult = validatePassword(formData.password);
      if (!pwdResult.valid) errors.password = pwdResult.message;
    }
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    const payload = { name: formData.name, phone: formData.phone };
    if (formData.password) payload.password = formData.password;
    if (editingId) {
      await mockApi.updateDriver(editingId, payload);
    } else {
      await mockApi.addDriver({ ...payload, password: formData.password });
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

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">
          Drivers
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
          Manage driver accounts and assignments
        </p>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or phone…"
            className="w-full sm:flex-1 sm:min-w-[120px]"
          />
          <SortDropdown value={sortBy} onChange={setSortBy} placeholder="Sort by" />
          <Button onClick={openAdd} variant="primary" className="w-full sm:w-auto shrink-0">
            <Plus className="w-5 h-5" />
            Add Driver
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {editingId ? 'Edit Driver' : 'Add Driver'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(emptyForm);
                  setFieldErrors({ name: '', phone: '', password: '' });
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val))
                      setFormData({ ...formData, phone: val });
                  }}
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none ${fieldErrors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Password {!editingId && <span className="text-red-500">*</span>}
                  {editingId && <span className="text-gray-500 font-normal">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 20 && /^[a-zA-Z0-9]*$/.test(val))
                      setFormData({ ...formData, password: val });
                  }}
                  maxLength={20}
                  placeholder={editingId ? 'Leave blank to keep current' : 'Alphanumeric only, max 20 characters'}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none ${fieldErrors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {fieldErrors.password}
                  </p>
                )}
              </div>
              <Button type="submit" variant="primary" fullWidth disabled={getSubmitDisabled()}>
                {editingId ? 'Update Driver' : 'Add Driver'}
              </Button>
            </form>
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
        {paginated.map((driver) => (
          <TileCard
            key={driver.id}
            title={driver.name || 'Unnamed Driver'}
            status={driver.status}
            fields={[
              { label: 'Phone', value: driver.phone, mono: true }
            ]}
            onEdit={() => openEdit(driver)}
            onDelete={() => setDeleteConfirm({ open: true, id: driver.id })}
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
