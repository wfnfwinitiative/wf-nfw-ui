import { useState } from 'react';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';

const EMPTY_FORM = { foodName: '', quantity: '', quantityError: '' };

const validateQuantity = (value) => {
  if (!value) return '';
  const num = Number(value);
  return !isNaN(num) && num > 0 ? '' : 'Must be a number greater than 0';
};

function QuantityInput({ value, onChange, error }) {
  return (
    <div>
      <div className={`flex items-center border rounded-lg overflow-hidden ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <input
          type="tel"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^\d*\.?\d*$/.test(val)) onChange(e);
          }}
          className="flex-1 px-3 py-2 text-sm outline-none border-none"
          placeholder="Quantity"
        />
        <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm font-medium border-l border-gray-300">kg</span>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ItemForm({ form, onChange, onSave, onCancel, saveLabel = 'Add', autoFocus = false }) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={form.foodName}
        onChange={(e) => onChange({ ...form, foodName: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg text-sm sm:text-lg"
        placeholder="Food name"
        autoFocus={autoFocus}
      />
      <QuantityInput
        value={form.quantity}
        onChange={(e) => onChange({ ...form, quantity: e.target.value, quantityError: '' })}
        error={form.quantityError}
      />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">
          Cancel
        </button>
        <button onClick={onSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

export function FoodItemsGrid({ items = [], onItemsChange, readonly = false }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_FORM);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ foodName: item.foodName, quantity: item.quantity || '', quantityError: '' });
  };

  const handleSaveEdit = (id) => {
    const error = validateQuantity(editForm.quantity);
    if (error) { setEditForm(f => ({ ...f, quantityError: error })); return; }
    const normalized = { ...editForm, quantity: editForm.quantity ? String(Number(editForm.quantity)) : '' };
    onItemsChange(items.map(item => item.id === id ? { ...item, ...normalized } : item));
    setEditingId(null);
  };

  const handleAddItem = () => {
    if (!newItem.foodName.trim()) return;
    const error = validateQuantity(newItem.quantity);
    if (error) { setNewItem(f => ({ ...f, quantityError: error })); return; }
    const quantity = newItem.quantity ? String(Number(newItem.quantity)) : '';
    onItemsChange([...items, { id: Date.now(), foodName: newItem.foodName, quantity }]);
    setNewItem(EMPTY_FORM);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No items yet</p>
          <p className="text-sm">Use voice or add manually</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              {editingId === item.id ? (
                <ItemForm
                  form={editForm}
                  onChange={setEditForm}
                  onSave={() => handleSaveEdit(item.id)}
                  onCancel={() => setEditingId(null)}
                  saveLabel={<Check className="w-5 h-5" />}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900">{item.foodName}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity && <span className="mr-3">📦 {item.quantity} kg</span>}
                    </p>
                  </div>
                  {!readonly && (
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button onClick={() => onItemsChange(items.filter(i => i.id !== item.id))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddForm ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3">
          <ItemForm
            form={newItem}
            onChange={setNewItem}
            onSave={handleAddItem}
            onCancel={() => { setShowAddForm(false); setNewItem(EMPTY_FORM); }}
            saveLabel="Add"
            autoFocus
          />
        </div>
      ) : (
        !readonly && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Item Manually
          </button>
        )
      )}
    </div>
  );
}

export default FoodItemsGrid;
