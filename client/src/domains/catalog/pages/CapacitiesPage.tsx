import { useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useEntityDialogs } from "@/shared/hooks/useEntityDialogs";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DataTable, type Column } from "@/shared/ui/DataTable";
import { CapacityFormDialog } from "../components/CapacityFormDialog";
import { useCapacities, useDeleteCapacity } from "../hooks/useCapacities";
import type { Capacity } from "../model/types";

export function CapacitiesPage() {
  const list = usePagedList();
  const dialogs = useEntityDialogs<Capacity>();
  const [error, setError] = useState("");
  const query = useCapacities(list.params);
  const remove = useDeleteCapacity();

  const columns: Column<Capacity>[] = [
    { label: "Capacity", render: (row) => `${row.capacityKg} kg` },
    {
      label: "Actions",
      render: (row) => (
        <Button
          color="error"
          onClick={() => {
            setError("");
            dialogs.askDelete(row);
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Capacities</Typography>
        <Button variant="contained" onClick={dialogs.openCreate}>
          Add capacity
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {query.isError && (
        <Alert severity="error">Could not load capacities. Please try again.</Alert>
      )}
      <DataTable
        rows={query.data?.items ?? []}
        columns={columns}
        total={query.data?.meta.total ?? 0}
        loading={query.isFetching}
        getRowKey={(row) => row.id}
        {...list.tableProps}
      />
      <CapacityFormDialog open={dialogs.formOpen} onClose={dialogs.closeForm} />
      <ConfirmDialog
        open={Boolean(dialogs.deleting)}
        title="Delete capacity?"
        description={`Delete ${dialogs.deleting?.capacityKg ?? "this"} kg? Machines already using it keep their capacity.`}
        busy={remove.isPending}
        onCancel={dialogs.closeDelete}
        onConfirm={() =>
          dialogs.deleting &&
          remove.mutate(dialogs.deleting.id, {
            onSuccess: dialogs.closeDelete,
            onError: (err) => {
              dialogs.closeDelete();
              setError(getApiErrorMessage(err, "Could not delete capacity."));
            },
          })
        }
      />
    </Stack>
  );
}
