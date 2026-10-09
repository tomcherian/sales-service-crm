import { useEffect, useState } from "react";
import { Alert, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@/shared/api/errors";
import { FormDialog } from "@/shared/ui/FormDialog";
import { useSaveEmployee } from "../hooks/useStaff";
import {
  MIN_PASSWORD_LENGTH,
  employeeFormFields,
  employeeFormSchema,
  getPasswordError,
  toEmployeeFormValues,
  toEmployeePayload,
  type EmployeeFormValues,
} from "../model/employeeForm";
import type { Employee, StaffRole } from "../model/types";

interface Props {
  open: boolean;
  role: StaffRole;
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeFormDialog({ open, role, employee, onClose }: Props) {
  const isEditing = Boolean(employee);
  const [formError, setFormError] = useState<string>();
  const save = useSaveEmployee();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: toEmployeeFormValues(null),
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset(toEmployeeFormValues(employee));
      setFormError(undefined);
      save.reset();
    }
    // Only re-initialise when the dialog opens for a (different) employee.
  }, [open, employee]);

  const submit = form.handleSubmit((values) => {
    const passwordError = getPasswordError(values.password, isEditing);
    if (passwordError) {
      form.setError("password", { type: "validate", message: passwordError });
      return;
    }
    setFormError(undefined);
    save.mutate(
      { id: employee?.id, payload: toEmployeePayload(values, role) },
      {
        onSuccess: onClose,
        onError: (error) =>
          setFormError(
            applyServerErrors(error, form.setError, employeeFormFields, "Could not save employee."),
          ),
      },
    );
  });

  return (
    <FormDialog
      open={open}
      title={isEditing ? "Edit employee" : "Add employee"}
      busy={save.isPending}
      onClose={onClose}
      onSubmit={submit}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {formError && <Alert severity="error">{formError}</Alert>}
        <TextField
          label="Name"
          {...form.register("name")}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
        />
        <TextField
          label="Email"
          type="email"
          {...form.register("email")}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
        <TextField
          label={isEditing ? "New password" : "Password"}
          type="password"
          {...form.register("password")}
          error={Boolean(errors.password)}
          helperText={
            errors.password?.message ??
            (isEditing
              ? "Leave blank to keep the current password."
              : `At least ${MIN_PASSWORD_LENGTH} characters.`)
          }
        />
        <TextField
          label="Phone"
          {...form.register("phone")}
          error={Boolean(errors.phone)}
          helperText={errors.phone?.message}
        />
        {role === "salesperson" && (
          <TextField
            label="Team lead ID (optional)"
            {...form.register("teamLead")}
            error={Boolean(errors.teamLead)}
            helperText={errors.teamLead?.message}
          />
        )}
      </Stack>
    </FormDialog>
  );
}
