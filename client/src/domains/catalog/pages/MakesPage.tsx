import { useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useEntityDialogs } from "@/shared/hooks/useEntityDialogs";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DataTable } from "@/shared/ui/DataTable";
import { MakeFormDialog } from "../components/MakeFormDialog";
import { makeColumns } from "../components/makeColumns";
import { useMakes, useSetMakeActive } from "../hooks/useMakes";
import type { Make } from "../model/types";

export function MakesPage() {
  const list = usePagedList();
  const dialogs = useEntityDialogs<Make>();
  const [error, setError] = useState("");
  const query = useMakes(list.params);
  const setActive = useSetMakeActive();

  const columns = makeColumns({
    onEdit: dialogs.openEdit,
    onDeactivate: (make) => {
      setError("");
      dialogs.askDelete(make);
    },
    onReactivate: (make) => {
      setError("");
      setActive.mutate(
        { id: make.id, isActive: true },
        { onError: (err) => setError(getApiErrorMessage(err, "Could not reactivate make.")) },
      );
    },
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Makes</Typography>
        <Button variant="contained" onClick={dialogs.openCreate}>
          Add make
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {query.isError && <Alert severity="error">Could not load makes. Please try again.</Alert>}
      <DataTable
        rows={query.data?.items ?? []}
        columns={columns}
        total={query.data?.meta.total ?? 0}
        loading={query.isFetching}
        getRowKey={(row) => row.id}
        {...list.tableProps}
      />
      <MakeFormDialog open={dialogs.formOpen} make={dialogs.editing} onClose={dialogs.closeForm} />
      <ConfirmDialog
        open={Boolean(dialogs.deleting)}
        title="Deactivate make?"
        description={`Deactivate ${dialogs.deleting?.name ?? "this make"}? Its machines stay as they are, but it can't be picked for new ones.`}
        busy={setActive.isPending}
        onCancel={dialogs.closeDelete}
        onConfirm={() =>
          dialogs.deleting &&
          setActive.mutate(
            { id: dialogs.deleting.id, isActive: false },
            {
              onSuccess: dialogs.closeDelete,
              onError: (err) => {
                dialogs.closeDelete();
                setError(getApiErrorMessage(err, "Could not deactivate make."));
              },
            },
          )
        }
      />
    </Stack>
  );
}
