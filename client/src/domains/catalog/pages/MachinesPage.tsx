import { useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useEntityDialogs } from "@/shared/hooks/useEntityDialogs";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DataTable } from "@/shared/ui/DataTable";
import { MachineFormDialog } from "../components/MachineFormDialog";
import { machineColumns } from "../components/machineColumns";
import { useMachines, useSetMachineActive } from "../hooks/useMachines";
import type { Machine } from "../model/types";

export function MachinesPage() {
  const list = usePagedList();
  const dialogs = useEntityDialogs<Machine>();
  const [error, setError] = useState("");
  const query = useMachines(list.params);
  const setActive = useSetMachineActive();

  const columns = machineColumns({
    onEdit: dialogs.openEdit,
    onDeactivate: (machine) => {
      setError("");
      dialogs.askDelete(machine);
    },
    onReactivate: (machine) => {
      setError("");
      setActive.mutate(
        { id: machine.id, isActive: true },
        { onError: (err) => setError(getApiErrorMessage(err, "Could not reactivate machine.")) },
      );
    },
  });

  const deactivating = dialogs.deleting;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Machines</Typography>
        <Button variant="contained" onClick={dialogs.openCreate}>
          Add machine
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {query.isError && (
        <Alert severity="error">Could not load machines. Please try again.</Alert>
      )}
      <DataTable
        rows={query.data?.items ?? []}
        columns={columns}
        total={query.data?.meta.total ?? 0}
        loading={query.isFetching}
        getRowKey={(row) => row.id}
        {...list.tableProps}
      />
      <MachineFormDialog
        open={dialogs.formOpen}
        machine={dialogs.editing}
        onClose={dialogs.closeForm}
      />
      <ConfirmDialog
        open={Boolean(deactivating)}
        title="Deactivate machine?"
        description={`Deactivate ${
          deactivating ? `${deactivating.makeName} ${deactivating.modelNumber}` : "this machine"
        }? It will stay on past records and can be reactivated later.`}
        busy={setActive.isPending}
        onCancel={dialogs.closeDelete}
        onConfirm={() =>
          deactivating &&
          setActive.mutate(
            { id: deactivating.id, isActive: false },
            {
              onSuccess: dialogs.closeDelete,
              onError: (err) => {
                dialogs.closeDelete();
                setError(getApiErrorMessage(err, "Could not deactivate machine."));
              },
            },
          )
        }
      />
    </Stack>
  );
}
