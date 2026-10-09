import { useEffect, useState } from "react";
import { Alert, MenuItem, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@/shared/api/errors";
import { FormDialog } from "@/shared/ui/FormDialog";
import { useSalespeople } from "@/domains/staff";
import { useSaveCustomer } from "../hooks/useCustomers";
import {
  customerFormFields,
  customerFormSchema,
  toCustomerFormValues,
  toCustomerPayload,
  type CustomerFormValues,
} from "../model/customerForm";
import { customerTypeLabels, type Customer } from "../model/types";

interface Props {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerFormDialog({ open, customer, onClose }: Props) {
  const [formError, setFormError] = useState<string>();
  const save = useSaveCustomer();
  const salespeople = useSalespeople();
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: toCustomerFormValues(null),
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset(toCustomerFormValues(customer));
      setFormError(undefined);
      save.reset();
    }
    // Only re-initialise when the dialog opens for a (different) customer.
  }, [open, customer]);

  const submit = form.handleSubmit((values) => {
    setFormError(undefined);
    save.mutate(
      { id: customer?.id, payload: toCustomerPayload(values) },
      {
        onSuccess: onClose,
        onError: (error) =>
          setFormError(
            applyServerErrors(error, form.setError, customerFormFields, "Could not save customer."),
          ),
      },
    );
  });

  return (
    <FormDialog
      open={open}
      title={customer ? "Edit customer" : "Add customer"}
      busy={save.isPending}
      onClose={onClose}
      onSubmit={submit}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {formError && <Alert severity="error">{formError}</Alert>}
        <TextField
          label="Name"
          required
          {...form.register("name")}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
        />
        {/* MUI selects are controlled, so they go through Controller rather than register. */}
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <TextField
              label="Type"
              select
              required
              {...field}
              error={Boolean(errors.type)}
              helperText={errors.type?.message}
            >
              {Object.entries(customerTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          label="Email"
          type="email"
          {...form.register("email")}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
        <TextField label="Phone" {...form.register("phone")} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
        <TextField label="Country" {...form.register("country")} error={Boolean(errors.country)} helperText={errors.country?.message} />
        <TextField label="City" {...form.register("city")} error={Boolean(errors.city)} helperText={errors.city?.message} />
        <TextField
          label="Address"
          multiline
          minRows={2}
          {...form.register("address")}
          error={Boolean(errors.address)}
          helperText={errors.address?.message}
        />
        <Controller
          control={form.control}
          name="assignedSalesperson"
          render={({ field }) => (
            <TextField
              label="Assigned salesperson"
              select
              {...field}
              error={Boolean(errors.assignedSalesperson)}
              helperText={errors.assignedSalesperson?.message}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {salespeople.data?.items.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.name} ({person.email})
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {salespeople.isError && (
          <Alert severity="warning">
            Could not load salesperson choices. You can still save without an assignment.
          </Alert>
        )}
        <TextField
          label="Notes"
          multiline
          minRows={2}
          {...form.register("notes")}
          error={Boolean(errors.notes)}
          helperText={errors.notes?.message}
        />
      </Stack>
    </FormDialog>
  );
}
