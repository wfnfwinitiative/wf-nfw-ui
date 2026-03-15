import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchBar } from '../../components/ui';
import { validatePassword, validatePhone } from '../../utils/validation';
import { UserApi } from '../../services/api/userService';
import { Plus, X, Loader2, UserPlus, KeyRound, Shield, Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyCreateForm = { name: '', phone: '', email: '', password: '' };
const emptyResetForm = { phone: '', newPassword: '' };

export const SupportAdminDashboard = () => {
  // Tab state: 'create' or 'reset'
  const [activeTab, setActiveTab] = useState('create');

  // --- Create Admin ---
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // --- Reset Admin ---
  const [resetForm, setResetForm] = useState(emptyResetForm);
  const [resetFieldErrors, setResetFieldErrors] = useState({});
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // --- Admin List ---
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setAdminsLoading(true);
    try {
      const users = await UserApi.getUserByRole('ADMIN');
      const adminList = users
        .filter((u) => u.roles && u.roles.includes('ADMIN'))
        .map((u) => ({
          id: u.user_id || u.id,
          name: u.name,
          phone: u.mobile_number || u.phone,
          email: u.email || '',
          isActive: u.is_active !== false,
        }));
      setAdmins(adminList);
    } catch (error) {
      console.error('Failed to load admins:', error);
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  };

  const filteredAdmins = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.phone || '').toString().includes(q) ||
        (a.email || '').toLowerCase().includes(q)
    );
  }, [admins, searchQuery]);

  // --- Create Admin Handlers ---
  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.name.trim()) errors.name = 'Name is required.';

    const phoneResult = validatePhone(createForm.phone, true);
    if (!phoneResult.valid) errors.phone = phoneResult.message;

    if (createForm.email.trim() && !EMAIL_REGEX.test(createForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const pwdResult = validatePassword(createForm.password);
    if (!pwdResult.valid) errors.password = pwdResult.message;

    return errors;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    const errors = validateCreateForm();
    setCreateFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setCreateLoading(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        mobile_number: createForm.phone.trim(),
        password: createForm.password,
        role_name: 'ADMIN',
      };
      if (createForm.email.trim()) {
        payload.email = createForm.email.trim();
      }

      await UserApi.createAdmin(payload);
      setCreateSuccess('Admin user created successfully.');
      setCreateForm(emptyCreateForm);
      setCreateFieldErrors({});
      loadAdmins();
      setTimeout(() => setCreateSuccess(''), 5000);
    } catch (error) {
      console.error('Failed to create admin:', error);
      const errorMessage =
        (error.response?.data?.detail && Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) ||
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while creating admin.';
      setCreateError(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  // --- Reset Admin Handlers ---
  const validateResetForm = () => {
    const errors = {};

    const phoneResult = validatePhone(resetForm.phone, true);
    if (!phoneResult.valid) errors.phone = phoneResult.message;

    const pwdResult = validatePassword(resetForm.newPassword);
    if (!pwdResult.valid) errors.newPassword = pwdResult.message;

    return errors;
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const errors = validateResetForm();
    setResetFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setResetLoading(true);
    try {
      await UserApi.resetAdminPassword({
        mobile_number: resetForm.phone.trim(),
        new_password: resetForm.newPassword,
      });
      setResetSuccess('Admin password reset successfully.');
      setResetForm(emptyResetForm);
      setResetFieldErrors({});
      setTimeout(() => setResetSuccess(''), 5000);
    } catch (error) {
      console.error('Failed to reset admin password:', error);
      const errorMessage =
        (error.response?.data?.detail && Array.isArray(error.response.data.detail) && error.response.data.detail[0]?.msg) ||
        (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
        'An error occurred while resetting password.';
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetForAdmin = (admin) => {
    setActiveTab('reset');
    setResetForm({ phone: admin.phone || '', newPassword: '' });
    setResetFieldErrors({});
    setResetError('');
    setResetSuccess('');
  };

  const isCreateDisabled = () => {
    if (!createForm.name.trim()) return true;
    if (!validatePhone(createForm.phone, true).valid) return true;
    if (!validatePassword(createForm.password).valid) return true;
    if (createForm.email.trim() && !EMAIL_REGEX.test(createForm.email.trim())) return true;
    return false;
  };

  const isResetDisabled = () => {
    if (!validatePhone(resetForm.phone, true).valid) return true;
    if (!validatePassword(resetForm.newPassword).valid) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-ngo-orange" />
            Support Admin Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create new admin users and reset admin passwords.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'create'
              ? 'border-ngo-orange text-ngo-orange'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Create Admin User
        </button>
        <button
          onClick={() => setActiveTab('reset')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reset'
              ? 'border-ngo-orange text-ngo-orange'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Reset Admin Password
        </button>
      </div>

      {/* Create Admin Tab */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create First Admin User</h2>

          {createSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl text-green-700 dark:text-green-300 text-sm">
              {createSuccess}
            </div>
          )}
          {createError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4 max-w-lg" autoComplete="off">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent"
                placeholder="Enter admin name"
                maxLength={100}
              />
              {createFieldErrors.name && <p className="text-red-500 text-xs mt-1">{createFieldErrors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent"
                placeholder="10-digit phone number"
                maxLength={10}
              />
              {createFieldErrors.phone && <p className="text-red-500 text-xs mt-1">{createFieldErrors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent"
                placeholder="admin@example.com"
              />
              {createFieldErrors.email && <p className="text-red-500 text-xs mt-1">{createFieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
              <input
                type={showCreatePassword ? 'text' : 'password'}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent"
                placeholder="Min 8 chars, max 20"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setShowCreatePassword(!showCreatePassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                tabIndex={-1}
              >
                {showCreatePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              </div>
              {createFieldErrors.password && <p className="text-red-500 text-xs mt-1">{createFieldErrors.password}</p>}
            </div>

            <Button type="submit" disabled={isCreateDisabled() || createLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Admin User
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Reset Admin Password Tab */}
      {activeTab === 'reset' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reset Admin Account Password</h2>

          {resetSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl text-green-700 dark:text-green-300 text-sm">
              {resetSuccess}
            </div>
          )}
          {resetError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {resetError}
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="space-y-4 max-w-lg" autoComplete="off">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={resetForm.phone}
                onChange={(e) => setResetForm({ ...resetForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent"
                placeholder="10-digit phone of the admin account"
                maxLength={10}
              />
              {resetFieldErrors.phone && <p className="text-red-500 text-xs mt-1">{resetFieldErrors.phone}</p>}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
              <input
                type={showResetPassword ? 'text' : 'password'}
                value={resetForm.newPassword}
                onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ngo-orange focus:border-transparent"
                placeholder="Min 8 chars, max 20"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setShowResetPassword(!showResetPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                tabIndex={-1}
              >
                {showResetPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              </div>
              {resetFieldErrors.newPassword && <p className="text-red-500 text-xs mt-1">{resetFieldErrors.newPassword}</p>}
            </div>

            <Button type="submit" disabled={isResetDisabled() || resetLoading}>
              {resetLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Existing Admin Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Existing Admin Users</h2>
          <div className="w-full sm:w-64">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search admins..." />
          </div>
        </div>

        {adminsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-ngo-orange" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading admins...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No admins match your search.' : 'No admin users found. Create one above.'}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{admin.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{admin.phone}</p>
                  {admin.email && <p className="text-sm text-gray-400 dark:text-gray-500">{admin.email}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      admin.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Button variant="secondary" onClick={() => handleResetForAdmin(admin)}>
                    <KeyRound className="w-4 h-4" />
                    Reset
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
