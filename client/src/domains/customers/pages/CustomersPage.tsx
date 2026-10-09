import { useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useEntityDialogs } from "@/shared/hooks/useEntityDialogs";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DataTable } from "@/shared/ui/DataTable";
import { CustomerFormDialog } from "../components/CustomerFormDialog";
import { customerColumns } from "../components/customerColumns";
import { useCustomers, useDeleteCustomer } from "../hooks/useCustomers";
import type { Customer } from "../model/types";

export function CustomersPage() {
  const list = usePagedList();
  const dialogs = useEntityDialogs<Customer>();
  const [error, setError] = useState("");
  const query = useCustomers(list.params);
  const remove = useDeleteCustomer();

  const columns = customerColumns({
    onEdit: dialogs.openEdit,
    onDelete: (customer) => {
      setError("");
      dialogs.askDelete(customer);
    },
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Customers</Typography>
        <Button variant="contained" onClick={dialogs.openCreate}>
          Add customer
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {query.isError && (
        <Alert severity="error">Could not load customers. Please try again.</Alert>
      )}
      <DataTable
        rows={query.data?.items ?? []}
        columns={columns}
        total={query.data?.meta.total ?? 0}
        loading={query.isFetching}
        getRowKey={(row) => row.id}
        {...list.tableProps}
      />
      <CustomerFormDialog
        open={dialogs.formOpen}
        customer={dialogs.editing}
        onClose={dialogs.closeForm}
      />
      <ConfirmDialog
        open={Boolean(dialogs.deleting)}
        title="Delete customer?"
        description={`Delete ${dialogs.deleting?.name ?? "this customer"}? This cannot be undone.`}
        busy={remove.isPending}
        onCancel={dialogs.closeDelete}
        onConfirm={() =>
          dialogs.deleting &&
          remove.mutate(dialogs.deleting.id, {
            onSuccess: dialogs.closeDelete,
            onError: (err) => {
              dialogs.closeDelete();
              setError(getApiErrorMessage(err, "Could not delete customer."));
            },
          })
        }
      />
    </Stack>
  );
}
