import { Button, Stack } from "@mui/material";
import { formatMoney } from "@/shared/lib/money";
import type { Column } from "@/shared/ui/DataTable";
import { machineTypeLabels, type Machine } from "../model/types";

interface Actions {
  onEdit: (machine: Machine) => void;
  onDeactivate: (machine: Machine) => void;
  onReactivate: (machine: Machine) => void;
}

export function machineColumns({ onEdit, onDeactivate, onReactivate }: Actions): Column<Machine>[] {
  return [
    { label: "Make", render: (row) => row.makeName },
    { label: "Model", render: (row) => row.modelNumber },
    { label: "Capacity", render: (row) => `${row.capacityKg} kg` },
    { label: "Type", render: (row) => machineTypeLabels[row.type] },
    { label: "Cost", render: (row) => formatMoney(row.costPrice) },
    { label: "Retail", render: (row) => formatMoney(row.retailPrice) },
    { label: "Wholesale", render: (row) => formatMoney(row.wholesalePrice) },
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
