import { useEffect, useState } from "react";
import { Alert, MenuItem, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@/shared/api/errors";
import { FormDialog } from "@/shared/ui/FormDialog";
import { useCapacityOptions } from "../hooks/useCapacities";
import { useSaveMachine } from "../hooks/useMachines";
import { useMakeOptions } from "../hooks/useMakes";
import {
  machineFormFields,
  machineFormSchema,
  toMachineFormValues,
  toMachinePayload,
  type MachineFormValues,
} from "../model/machineForm";
import { machineTypeLabels, type Machine } from "../model/types";

interface Props {
  open: boolean;
  machine: Machine | null;
  onClose: () => void;
}

const decimalInput = { htmlInput: { inputMode: "decimal" } } as const;

export function MachineFormDialog({ open, machine, onClose }: Props) {
  const [formError, setFormError] = useState<string>();
  const save = useSaveMachine();
  const makes = useMakeOptions();
  const capacities = useCapacityOptions();
  const form = useForm<MachineFormValues>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: toMachineFormValues(null),
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset(toMachineFormValues(machine));
      setFormError(undefined);
      save.reset();
    }
    // Only re-initialise when the dialog opens for a (different) machine.
  }, [open, machine]);

  // The pickers only load current options, so add the machine's own values when its make
  // has since been deactivated or its capacity option removed.
  const makeOptions = (makes.data?.items ?? []).map((make) => ({ id: make.id, label: make.name }));
  if (machine && !makeOptions.some((option) => option.id === machine.makeId)) {
    makeOptions.unshift({ id: machine.makeId, label: `${machine.makeName} (inactive)` });
  }
  const capacityOptions = (capacities.data?.items ?? []).map((capacity) => capacity.capacityKg);
  if (machine && !capacityOptions.includes(machine.capacityKg)) {
    capacityOptions.unshift(machine.capacityKg);
  }
  const missingMasterData =
    (makes.isSuccess && makeOptions.length === 0) ||
    (capacities.isSuccess && capacityOptions.length === 0);

  const submit = form.handleSubmit((values) => {
    setFormError(undefined);
    save.mutate(
      { id: machine?.id, payload: toMachinePayload(values) },
      {
        onSuccess: onClose,
        onError: (error) =>
          setFormError(
            applyServerErrors(error, form.setError, machineFormFields, "Could not save machine."),
          ),
      },
    );
  });

  return (
    <FormDialog
      open={open}
      title={machine ? "Edit machine" : "Add machine"}
      busy={save.isPending}
      onClose={onClose}
      onSubmit={submit}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {formError && <Alert severity="error">{formError}</Alert>}
        {(makes.isError || capacities.isError) && (
          <Alert severity="error">Could not load the make and capacity choices.</Alert>
        )}
        {missingMasterData && (
          <Alert severity="info">
            Add at least one make and one capacity before adding a machine.
          </Alert>
        )}
        {/* MUI selects are controlled, so they go through Controller rather than register. */}
        <Controller
          control={form.control}
          name="make"
          render={({ field }) => (
            <TextField
              label="Make"
              select
              required
              {...field}
              error={Boolean(errors.make)}
              helperText={errors.make?.message}
            >
              {makeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          label="Model"
          required
          {...form.register("modelNumber")}
          error={Boolean(errors.modelNumber)}
          helperText={errors.modelNumber?.message}
        />
        <Controller
          control={form.control}
          name="capacityKg"
          render={({ field }) => (
            <TextField
              label="Capacity"
              select
              required
              {...field}
              error={Boolean(errors.capacityKg)}
              helperText={errors.capacityKg?.message}
            >
              {capacityOptions.map((capacityKg) => (
                <MenuItem key={capacityKg} value={String(capacityKg)}>
                  {capacityKg} kg
                </MenuItem>
              ))}
            </TextField>
          )}
        />
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
              {Object.entries(machineTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          label="Cost price"
          required
          slotProps={decimalInput}
          {...form.register("costPrice")}
          error={Boolean(errors.costPrice)}
          helperText={errors.costPrice?.message}
        />
        <TextField
          label="Retail price"
          required
          slotProps={decimalInput}
          {...form.register("retailPrice")}
          error={Boolean(errors.retailPrice)}
          helperText={errors.retailPrice?.message}
        />
        <TextField
          label="Wholesale price"
          required
          slotProps={decimalInput}
          {...form.register("wholesalePrice")}
          error={Boolean(errors.wholesalePrice)}
          helperText={errors.wholesalePrice?.message}
        />
      </Stack>
    </FormDialog>
  );
}
