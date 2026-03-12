import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchBar, SortDropdown, sortList } from '../../components/ui';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { CoordinatorCard } from '../../components/cards/CoordinatorCard';
import { validatePassword, validatePhone } from '../../utils/validation';
import { Plus, X, Loader2 } from 'lucide-react';
import { UserApi } from '../../services/api/userService';

const emptyForm = { name: '', phone: '', email: '', password: '', role: 'COORDINATOR' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Coordinators = () => {
  const [pageError, setPageError] = useState('');
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', phone: '', email: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadCoordinators();
  }, []);

  const loadCoordinators = async () => {
    setLoading(true);
    try {
      const users = await UserApi.getUserByRole('COORDINATOR');
      const coordinatorsData = users
        .filter((u) => u.roles && u.roles.includes('COORDINATOR'))
        .map((u) => ({
          id: u.user_id,
          name: u.name,
          phone: u.mobile_number,
          email: u.email || '',
        }));
      setCoordinators(coordinatorsData);
    } catch (error) {
      console.error('Failed to load coordinators:', error);
      setCoordinators([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const list = [...coordinators];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').toString().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    );
  }, [coordinators, searchQuery]);

  const sorted = useMemo(
    () => sortList(filtered, sortBy, (c) => c.name || '', (c) => c.id || 0),
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
    setFieldErrors({ name: '', phone: '', email: '', password: '' });
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      name: row.name ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      password: '',
      role: 'COORDINATOR'
    });
    setFormError('');
    setFieldErrors({ name: '', phone: '', email: '', password: '' });
    setShowForm(true);
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) return true;
    return EMAIL_REGEX.test(email.trim());
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
    if (formData.email.trim() && !validateEmail(formData.email)) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errors = { name: '', phone: '', email: '', password: '' };
    const phoneResult = validatePhone(formData.phone, true);
    if (!phoneResult.valid) errors.phone = phoneResult.message;
    if (formData.email.trim() && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!editingId) {
      const pwdResult = validatePassword(formData.password);
      if (!pwdResult.valid) errors.password = pwdResult.message;
    } else if (formData.password) {
      const pwdResult = validatePassword(formData.password);
      if (!pwdResult.valid) errors.password = pwdResult.message;
    }
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    try {
      if (editingId) {
        const payload = {
          name: formData.name,
          mobile_number: formData.phone,
        };
        if (formData.email) {
          payload.email = formData.email;
        }
        if (formData.password) {
          payload.password = formData.password;
        }
        const response = await UserApi.updateCoordinator(editingId, payload);
        setSuccessMessage(typeof response === 'string' ? response : 'Coordinator updated successfully.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const payload = {
          name: formData.name,
          mobile_number: formData.phone,
          password: formData.password,
          role_name: 'COORDINATOR',
        };
        await UserApi.createCoordinator(payload);
        setSuccessMessage('Coordinator created successfully.');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadCoordinators();
    } catch (error) {
      console.error('Failed to save coordinator:', error);
      const errorMessage =
        (error.response?.data?.detail && Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) ||
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while saving.';
      setFormError(errorMessage);
    }
  };

  const handleDeleteClick = (id) => setDeleteConfirm({ open: true, id });

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      const response = await UserApi.deleteCoordinator(deleteConfirm.id);
      setSuccessMessage(typeof response === 'string' ? response : 'Coordinator deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
      setDeleteConfirm({ open: false, id: null });
      loadCoordinators();
    } catch (error) {
      console.error('Failed to delete coordinator:', error);
      const errorMessage =
        (error.response?.data?.detail && Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) ||
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while deleting.';
      setPageError(errorMessage);
      setTimeout(() => setPageError(''), 5000);
      setDeleteConfirm({ open: false, id: null });
    }
  };

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">
          Coordinators
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
          Manage coordinator accounts
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
            placeholder="Search by name or phone…"
            className="w-full sm:flex-1 sm:min-w-[120px]"
          />
          <SortDropdown value={sortBy} onChange={setSortBy} placeholder="Sort by" />
          <Button onClick={openAdd} variant="primary" className="w-full sm:w-auto shrink-0">
            <Plus className="w-5 h-5" />
            Add Coordinator
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {editingId ? 'Edit Coordinator' : 'Add Coordinator'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(emptyForm);
                  setFormError('');
                  setFieldErrors({ name: '', phone: '', email: '', password: '' });
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
                  Email <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. coordinator@example.com"
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none ${fieldErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {fieldErrors.email}
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
                {editingId ? 'Update Coordinator' : 'Add Coordinator'}
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

      {loading ? (
        <div className="flex justify-center items-center p-16">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paginated.map((coordinator) => (
              <CoordinatorCard
                key={coordinator.id}
                coordinator={coordinator}
                onEdit={() => openEdit(coordinator)}
                onDelete={() => handleDeleteClick(coordinator.id)}
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
