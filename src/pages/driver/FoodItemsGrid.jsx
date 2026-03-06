import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export function FoodItemsGrid({ items = [], onItemsChange }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ foodName: '', quantity: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ foodName: '', quantity: '' });

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ 
      foodName: item.foodName, 
      quantity: item.quantity || '' 
    });
  };

  const handleSaveEdit = (id) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, ...editForm } : item
    );
    onItemsChange(updated);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    if (!newItem.foodName.trim()) return;
    
    const item = {
      id: Date.now(),
      foodName: newItem.foodName,
      quantity: newItem.quantity || ''
    };
    onItemsChange([...items, item]);
    setNewItem({ foodName: '', quantity: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-3">
      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No items yet</p>
          <p className="text-sm">Use voice or add manually</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
            >
              {editingId === item.id ? (
                // Edit Mode
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.foodName}
                    onChange={(e) => setEditForm({ ...editForm, foodName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-lg"
                    placeholder="Food name"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                      className="w-full sm:flex-1 px-3 py-2 border rounded-lg text-sm"
                      placeholder="Quantity (e.g., 5 kg)"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900">{item.foodName}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity && <span className="mr-3">📦 {item.quantity}</span>}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 space-y-2">
          <input
            type="text"
            value={newItem.foodName}
            onChange={(e) => setNewItem({ ...newItem, foodName: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm sm:text-lg"
            placeholder="Food name"
            autoFocus
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="w-full sm:flex-1 px-3 py-2 border rounded-lg text-sm"
              placeholder="Quantity"
            />
          </div>
          <div className="flex gap-2 justify-end">
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Item Manually
        </button>
      )}
    </div>
  );
}

export default FoodItemsGrid;
