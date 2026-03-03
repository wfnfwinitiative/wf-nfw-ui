import React from 'react';
import { Button } from './ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

/**
 * Reusable row actions: Edit + Delete. Use in table/list views.
 */
export const ActionButtons = ({ onEdit, onDelete, editLabel = 'Edit', deleteLabel = 'Delete' }) => (
  <div className="flex flex-row items-center gap-2 flex-wrap">
    <Button variant="secondary" onClick={onEdit} className="!h-9 !py-2 !text-xs">
      <Pencil className="w-3.5 h-3.5" />
      {editLabel}
    </Button>
    <Button variant="danger" onClick={onDelete} className="!h-9 !py-2 !text-xs">
      <Trash2 className="w-3.5 h-3.5" />
      {deleteLabel}
    </Button>
  </div>
);
