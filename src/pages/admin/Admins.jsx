import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchBar, SortDropdown, sortList } from '../../components/ui';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { TileCard } from '../../components/cards/TileCard';
import { validateName, validatePassword, validatePhone } from '../../utils/validation';
import { Plus, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { UserApi } from '../../services/api/userService';

const emptyForm = { name: '', phone: '', email: '', password: '' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ADDABLE_ROLES = ['COORDINATOR'];

export const Admins = () => {
  const [pageError, setPageError] = useState('');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingIsActive, setEditingIsActive] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', phone: '', email: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [activateConfirm, setActivateConfirm] = useState({ open: false, id: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Add-role state
  const [allRoles, setAllRoles] = useState([]);
  const [editingRoles, setEditingRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [addRoleLoading, setAddRoleLoading] = useState(false);

  useEffect(() => {
    loadAdmins();
    loadRoles();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const users = await UserApi.getUserByRole('ADMIN');
      const adminsData = users
        .filter((u) => u.roles && u.roles.includes('ADMIN'))
        .map((u) => ({
          id: u.user_id,
          name: u.name,
          phone: u.mobile_number,
          email: u.email || '',
          roles: u.roles || [],
          isActive: u.is_active !== false,
        }));
      setAdmins(adminsData);
    } catch (error) {
      console.error('Failed to load admins:', error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const roles = await UserApi.getRoles();
      setAllRoles(roles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [...admins];
    return admins.filter(
      (a) =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.phone || '').toString().includes(q) ||
        (a.email || '').toLowerCase().includes(q)
    );
  }, [admins, searchQuery]);

  const sorted = useMemo(
    () => {
      const list = sortList(filtered, sortBy, (a) => a.name || '', (a) => a.id || 0);
      return [...list.filter(a => a.isActive !== false), ...list.filter(a => a.isActive === false)];
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
    setEditingIsActive(true);
    setFormData(emptyForm);
    setFormError('');
    setFieldErrors({ name: '', phone: '', email: '', password: '' });
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setEditingIsActive(row.isActive !== false);
    setFormData({
      name: row.name ?? '',
      phone: row.phone ?? '',
      email: row.email ?? '',
      password: '',
    });
    setEditingRoles(row.roles || []);
    setSelectedRole('');
    setFormError('');
    setFieldErrors({ name: '', phone: '', email: '', password: '' });
    setShowForm(true);
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) return true;
    return EMAIL_REGEX.test(email.trim());
  };

  const getSubmitDisabled = () => {
    const nameResult = validateName(formData.name);
    if (!nameResult.valid) return true;
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
    const nameResult = validateName(formData.name);
    if (!nameResult.valid) errors.name = nameResult.message;
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
        if (formData.email) payload.email = formData.email;
        if (formData.password) payload.password = formData.password;
        const response = await UserApi.updateAdmin(editingId, payload);
        setSuccessMessage(typeof response === 'string' ? response : 'Admin updated successfully.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const payload = {
          name: formData.name,
          mobile_number: formData.phone,
          password: formData.password,
          role_name: 'ADMIN',
        };
        if (formData.email) payload.email = formData.email;
        await UserApi.createAdmin(payload);
        setSuccessMessage('Admin created successfully.');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      setFormData(emptyForm);
      setEditingId(null);
      setEditingIsActive(true);
      setShowForm(false);
      loadAdmins();
    } catch (error) {
      console.error('Failed to save admin:', error);
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
      const response = await UserApi.deleteAdmin(deleteConfirm.id);
      setSuccessMessage(typeof response === 'string' ? response : 'Admin deactivated successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
      setDeleteConfirm({ open: false, id: null });
      loadAdmins();
    } catch (error) {
      console.error('Failed to delete admin:', error);
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
      const response = await UserApi.activateUser(activateConfirm.id);
      setSuccessMessage(typeof response?.message === 'string' ? response.message : 'Admin activated successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
      loadAdmins();
    } catch (error) {
      console.error('Failed to activate admin:', error);
      const errorMessage =
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while activating.';
      setPageError(errorMessage);
      setTimeout(() => setPageError(''), 5000);
    } finally {
      setActivateConfirm({ open: false, id: null });
    }
  };

  const getAvailableRoles = (userRoles) => {
    return allRoles.filter(
      (r) => ADDABLE_ROLES.includes(r.role_name) && !userRoles.includes(r.role_name)
    );
  };

  const handleAddRole = async () => {
    if (!selectedRole || !editingId) return;
    const roleObj = allRoles.find((r) => r.role_name === selectedRole);
    if (!roleObj) return;

    setAddRoleLoading(true);
    try {
      await UserApi.assignRole(editingId, roleObj.role_id);
      setEditingRoles((prev) => [...prev, selectedRole]);
      setSelectedRole('');
      setSuccessMessage(`Role "${selectedRole}" added successfully.`);
      setTimeout(() => setSuccessMessage(''), 5000);
      loadAdmins();
    } catch (error) {
      console.error('Failed to add role:', error);
      const errorMessage =
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'Failed to add role.';
      setFormError(errorMessage);
    } finally {
      setAddRoleLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">
          Admins
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
          Manage admin accounts
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
            Add Admin
          </Button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                {editingId ? 'Edit Admin' : 'Add Admin'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setEditingIsActive(true);
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

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {formError}
                </p>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                  required
                  autoComplete="new-username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) setFormData({ ...formData, phone: val });
                  }}
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {fieldErrors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Email <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. admin@example.com"
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus-border-transparent outline-none ${fieldErrors.email ? 'border-red-500' : 'border-gray-300 dark-border-gray-600'}`}
                  autoComplete="new-email"
                />
                {fieldErrors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Password {!editingId && <span className="text-red-500">*</span>}
                  {editingId && <span className="text-gray-500 font-normal">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 20) setFormData({ ...formData, password: val });
                  }}
                  maxLength={20}
                  placeholder={editingId ? 'Leave blank to keep current' : 'Min 8 chars, max 20'}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus-border-transparent outline-none ${fieldErrors.password ? 'border-red-500' : 'border-gray-300 dark-border-gray-600'}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
                {fieldErrors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>}
              </div>
              <Button type="submit" variant="primary" fullWidth disabled={getSubmitDisabled()}>
                {editingId ? 'Update Admin' : 'Add Admin'}
              </Button>
            </form>

            {editingId && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Roles</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editingRoles.map((r) => (
                    <span key={r} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {r}
                    </span>
                  ))}
                </div>
                {getAvailableRoles(editingRoles).length > 0 && (
                  <div className="flex gap-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Add a role…</option>
                      {getAvailableRoles(editingRoles).map((r) => (
                        <option key={r.role_id} value={r.role_name}>{r.role_name}</option>
                      ))}
                    </select>
                    <Button
                      variant="primary"
                      disabled={!selectedRole || addRoleLoading}
                      onClick={handleAddRole}
                    >
                      {addRoleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={deleteConfirm.open}
        message="Are you sure you want to deactivate this admin?"
        confirmLabel="Deactivate"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />

      {/* Activate Confirmation */}
      <ConfirmationModal
        open={activateConfirm.open}
        message="Are you sure you want to activate this admin?"
        confirmLabel="Activate"
        onConfirm={handleActivateConfirm}
        onCancel={() => setActivateConfirm({ open: false, id: null })}
      />

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center p-16">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paginated.map((admin) => (
              <TileCard
                key={admin.id}
                title={admin.name || 'Unnamed Admin'}
                subtitle={admin.roles?.join(', ') || 'ADMIN'}
                status={admin.isActive !== false ? 'active' : 'inactive'}
                fields={[
                  { label: 'Phone', value: admin.phone, mono: true },
                  { label: 'Email', value: admin.email || 'N/A' },
                ]}
                onEdit={() => openEdit(admin)}
                onDelete={admin.isActive !== false ? () => handleDeleteClick(admin.id) : undefined}
                onActivate={admin.isActive === false ? () => setActivateConfirm({ open: true, id: admin.id }) : undefined}
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
