import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { ActionButtons } from '../../components/ActionButtons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { mockApi } from '../../services/mockApi';
import { Plus, X } from 'lucide-react';

const emptyForm = { name: '', phone: '', email: '', role: 'coordinator' };

export const Coordinators = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    loadCoordinators();
  }, []);

  const loadCoordinators = async () => {
    const users = await mockApi.getUsers();
    setCoordinators(users.filter(u => u.role === 'coordinator'));
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
      email: row.email ?? '',
      role: 'coordinator'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await mockApi.updateUser(editingId, { name: formData.name, phone: formData.phone, email: formData.email, role: 'coordinator' });
    } else {
      await mockApi.addUser({ name: formData.name, phone: formData.phone, email: formData.email, role: 'coordinator' });
    }
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    loadCoordinators();
  };

  const handleDeleteClick = (id) => setDeleteConfirm({ open: true, id });

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    await mockApi.deleteUser(deleteConfirm.id);
    setDeleteConfirm({ open: false, id: null });
    loadCoordinators();
  };

  const columns = [
    { header: 'Name', field: 'name' },
    { header: 'Phone', field: 'phone' },
    { header: 'Email', field: 'email' },
    {
      header: 'Status',
      render: () => <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <ActionButtons
          onEdit={() => openEdit(row)}
          onDelete={() => handleDeleteClick(row.id)}
          editLabel="Edit"
          deleteLabel="Delete"
        />
      )
    }
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">Coordinators</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage coordinator accounts</p>
        </div>
        <div className="flex flex-row items-center justify-end gap-3 flex-wrap md:flex-nowrap">
          <Button onClick={openAdd} variant="primary">
            <Plus className="w-5 h-5" />
            Add Coordinator
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">{editingId ? 'Edit Coordinator' : 'Add Coordinator'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); setFormData(emptyForm); }} className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                  required
                />
              </div>
              <Button type="submit" variant="primary" fullWidth>
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

      <div className="overflow-x-auto">
        <DataTable columns={columns} data={coordinators} />
      </div>
    </div>
  );
};
