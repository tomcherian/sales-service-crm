import { Button, Stack } from "@mui/material";
import type { Column } from "@/shared/ui/DataTable";
import { customerTypeLabels, type Customer } from "../model/types";

interface Actions {
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function customerColumns({ onEdit, onDelete }: Actions): Column<Customer>[] {
  return [
    { label: "Name", render: (row) => row.name },
    { label: "Type", render: (row) => customerTypeLabels[row.type] },
    { label: "Email", render: (row) => row.email || "—" },
    { label: "Phone", render: (row) => row.phone || "—" },
    { label: "City", render: (row) => row.city || "—" },
    {
      label: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Button onClick={() => onEdit(row)}>Edit</Button>
          <Button color="error" onClick={() => onDelete(row)}>
            Delete
          </Button>
        </Stack>
      ),
    },
  ];
}
