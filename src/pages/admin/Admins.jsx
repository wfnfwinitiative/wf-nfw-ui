import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchBar, SortDropdown, sortList } from '../../components/ui';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { validatePassword, validatePhone } from '../../utils/validation';
import { Plus, X, Loader2, ShieldCheck } from 'lucide-react';
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
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', phone: '', email: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  // Add-role state
  const [allRoles, setAllRoles] = useState([]);
  const [addRoleConfirm, setAddRoleConfirm] = useState({ open: false, user: null });
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
    () => sortList(filtered, sortBy, (a) => a.name || '', (a) => a.id || 0),
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
      setSuccessMessage(typeof response === 'string' ? response : 'Admin deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
      setDeleteConfirm({ open: false, id: null });
      loadAdmins();
    } catch (error) {
      console.error('Failed to delete admin:', error);
      const errorMessage =
        (error.response?.data?.detail && Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) ||
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while deleting.';
      setPageError(errorMessage);
      setTimeout(() => setPageError(''), 5000);
      setDeleteConfirm({ open: false, id: null });
    }
  };

  // Add Role handlers
  const openAddRole = (admin) => {
    setAddRoleConfirm({ open: true, user: admin });
    setSelectedRole('');
  };

  const getAvailableRoles = (userRoles) => {
    return allRoles.filter(
      (r) => ADDABLE_ROLES.includes(r.role_name) && !userRoles.includes(r.role_name)
    );
  };

  const handleAddRole = async () => {
    if (!selectedRole || !addRoleConfirm.user) return;
    const roleObj = allRoles.find((r) => r.role_name === selectedRole);
    if (!roleObj) return;

    setAddRoleLoading(true);
    try {
      await UserApi.assignRole(addRoleConfirm.user.id, roleObj.role_id);
      setSuccessMessage(`Role "${selectedRole}" added successfully.`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setAddRoleConfirm({ open: false, user: null });
      loadAdmins();
    } catch (error) {
      console.error('Failed to add role:', error);
      const errorMessage =
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'Failed to add role.';
      setPageError(errorMessage);
      setTimeout(() => setPageError(''), 5000);
      setAddRoleConfirm({ open: false, user: null });
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
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                  required
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
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none ${fieldErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {fieldErrors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>}
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
                    if (val.length <= 20 && /^[a-zA-Z0-9]*$/.test(val)) setFormData({ ...formData, password: val });
                  }}
                  maxLength={20}
                  placeholder={editingId ? 'Leave blank to keep current' : 'Alphanumeric only, max 20 characters'}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none ${fieldErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {fieldErrors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>}
              </div>
              <Button type="submit" variant="primary" fullWidth disabled={getSubmitDisabled()}>
                {editingId ? 'Update Admin' : 'Add Admin'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={deleteConfirm.open}
        message="Are you sure you want to delete this admin?"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />

      {/* Add Role Modal */}
      {addRoleConfirm.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Add Role</h2>
              <button
                onClick={() => setAddRoleConfirm({ open: false, user: null })}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Adding role for <span className="font-semibold">{addRoleConfirm.user?.name}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Current roles: {addRoleConfirm.user?.roles?.join(', ') || 'ADMIN'}
            </p>
            {getAvailableRoles(addRoleConfirm.user?.roles || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No additional roles available.</p>
            ) : (
              <>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none mb-4"
                >
                  <option value="">Select a role…</option>
                  {getAvailableRoles(addRoleConfirm.user?.roles || []).map((r) => (
                    <option key={r.role_id} value={r.role_name}>{r.role_name}</option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={!selectedRole || addRoleLoading}
                  onClick={handleAddRole}
                >
                  {addRoleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {addRoleLoading ? 'Adding…' : 'Add Role'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center p-16">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paginated.map((admin) => (
              <div key={admin.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800 p-4 md:p-5 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
                        {admin.name || 'Unnamed Admin'}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ngo-orange">
                        {admin.roles?.join(', ') || 'ADMIN'}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Active
                    </span>
                  </div>
                  {admin.phone && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Phone:</span>{' '}
                      <span className="font-mono tracking-wide">{admin.phone}</span>
                    </p>
                  )}
                  {admin.email && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                      <span className="font-medium">Email:</span> {admin.email}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button variant="secondary" className="flex-1 justify-center" onClick={() => openEdit(admin)}>
                    Edit
                  </Button>
                  <Button variant="secondary" className="flex-1 justify-center" onClick={() => openAddRole(admin)}>
                    <ShieldCheck className="w-4 h-4" />
                    Add Role
                  </Button>
                  <Button variant="danger" className="flex-1 justify-center" onClick={() => handleDeleteClick(admin.id)}>
                    Delete
                  </Button>
                </div>
              </div>
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
