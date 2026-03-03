import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.endsWith('/edit');

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? ''
  });

  useEffect(() => {
    if (user) setForm({ name: user.name ?? '', phone: user.phone ?? '', email: user.email ?? '' });
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    navigate('/profile');
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark dark:text-gray-200 mb-1 md:mb-2">
        {isEdit ? 'Edit Profile' : 'Profile'}
      </h1>
      <p className="text-sm md:text-base text-ngo-gray dark:text-gray-400 mb-6">
        {isEdit ? 'Update your details' : 'Your account information'}
      </p>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 md:p-8 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Name</label>
            {isEdit ? (
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none"
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-200 font-medium">{user.name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Role</label>
            <p className="text-gray-800 dark:text-gray-200 capitalize">{user.role}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Phone</label>
            {isEdit ? (
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none"
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-200">{user.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Email</label>
            {isEdit ? (
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange outline-none"
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-200">{user.email || '—'}</p>
            )}
          </div>
        </div>

        {isEdit ? (
          <div className="mt-6 flex gap-3">
            <Button type="button" variant="primary" onClick={handleSave}>Save</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/profile')}>Cancel</Button>
          </div>
        ) : (
          <div className="mt-6">
            <Button type="button" variant="primary" onClick={() => navigate('/profile/edit')}>Edit Profile</Button>
          </div>
        )}
      </div>
    </div>
  );
};
