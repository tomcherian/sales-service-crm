import { useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useEntityDialogs } from "@/shared/hooks/useEntityDialogs";
import { usePagedList } from "@/shared/hooks/usePagedList";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DataTable } from "@/shared/ui/DataTable";
import { EmployeeFormDialog } from "../components/EmployeeFormDialog";
import { employeeColumns } from "../components/employeeColumns";
import { useDeactivateEmployee, useEmployees } from "../hooks/useStaff";
import { staffRoleLabels, type Employee, type StaffRole } from "../model/types";

/** One page for every staff role; the route decides which role it lists. */
export function StaffPage({ role }: { role: StaffRole }) {
  const list = usePagedList();
  const dialogs = useEntityDialogs<Employee>();
  const [error, setError] = useState("");
  const query = useEmployees(role, list.params);
  const deactivate = useDeactivateEmployee();

  const columns = employeeColumns({
    onEdit: dialogs.openEdit,
    onDeactivate: (employee) => {
      setError("");
      dialogs.askDelete(employee);
    },
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">{staffRoleLabels[role]}</Typography>
        <Button variant="contained" onClick={dialogs.openCreate}>
          Add employee
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {query.isError && <Alert severity="error">Could not load employees.</Alert>}
      <DataTable
        rows={query.data?.items ?? []}
        columns={columns}
        total={query.data?.meta.total ?? 0}
        loading={query.isFetching}
        getRowKey={(row) => row.id}
        {...list.tableProps}
      />
      <EmployeeFormDialog
        open={dialogs.formOpen}
        role={role}
        employee={dialogs.editing}
        onClose={dialogs.closeForm}
      />
      <ConfirmDialog
        open={Boolean(dialogs.deleting)}
        title="Deactivate employee?"
        description={`Deactivate ${dialogs.deleting?.name ?? "this employee"}? They will no longer be able to sign in.`}
        busy={deactivate.isPending}
        onCancel={dialogs.closeDelete}
        onConfirm={() =>
          dialogs.deleting &&
          deactivate.mutate(dialogs.deleting.id, {
            onSuccess: dialogs.closeDelete,
            onError: (err) => {
              dialogs.closeDelete();
              setError(getApiErrorMessage(err, "Could not deactivate employee."));
            },
          })
        }
      />
    </Stack>
  );
}
