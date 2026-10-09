import { Button, Stack } from "@mui/material";
import type { Column } from "@/shared/ui/DataTable";
import type { Employee } from "../model/types";

interface Actions {
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
}

export function employeeColumns({ onEdit, onDeactivate }: Actions): Column<Employee>[] {
  return [
    { label: "Name", render: (row) => row.name },
    { label: "Email", render: (row) => row.email },
    { label: "Phone", render: (row) => row.phone || "—" },
    { label: "Status", render: (row) => (row.isActive ? "Active" : "Inactive") },
    {
      label: "Actions",
      render: (row) => (
        <Stack direction="row">
          <Button onClick={() => onEdit(row)}>Edit</Button>
          {row.isActive && (
            <Button color="error" onClick={() => onDeactivate(row)}>
              Deactivate
            </Button>
          )}
        </Stack>
      ),
    },
  ];
}
