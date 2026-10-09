import { useState } from "react";

/** Open/close state for the add-edit form dialog and the delete confirmation of a list page. */
export function useEntityDialogs<T>() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  return {
    formOpen,
    editing,
    deleting,
    openCreate: () => {
      setEditing(null);
      setFormOpen(true);
    },
    openEdit: (item: T) => {
      setEditing(item);
      setFormOpen(true);
    },
    closeForm: () => {
      setFormOpen(false);
      setEditing(null);
    },
    askDelete: setDeleting,
    closeDelete: () => setDeleting(null),
  };
}
