import { Button, Stack } from "@mui/material";
import type { Column } from "@/shared/ui/DataTable";
import type { Make } from "../model/types";

interface Actions {
  onEdit: (make: Make) => void;
  onDeactivate: (make: Make) => void;
  onReactivate: (make: Make) => void;
}

export function makeColumns({ onEdit, onDeactivate, onReactivate }: Actions): Column<Make>[] {
  return [
    { label: "Make", render: (row) => row.name },
    { label: "Company", render: (row) => row.companyName || "—" },
    { label: "Country", render: (row) => row.country || "—" },
    { label: "Status", render: (row) => (row.isActive ? "Active" : "Inactive") },
    {
      label: "Actions",
      render: (row) => (
        <Stack direction="row">
          <Button onClick={() => onEdit(row)}>Edit</Button>
          {row.isActive ? (
            <Button color="error" onClick={() => onDeactivate(row)}>
              Deactivate
            </Button>
          ) : (
            <Button onClick={() => onReactivate(row)}>Reactivate</Button>
          )}
        </Stack>
      ),
    },
  ];
}
