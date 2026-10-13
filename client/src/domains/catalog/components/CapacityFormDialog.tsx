import { useEffect, useState } from "react";
import { Alert, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { applyServerErrors } from "@/shared/api/errors";
import { FormDialog } from "@/shared/ui/FormDialog";
import { useCreateCapacity } from "../hooks/useCapacities";

// Kept as a string in the form so partial typing ("7.") isn't lost.
const capacityFormSchema = z.object({
  capacityKg: z
    .string()
    .trim()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, "Enter a capacity such as 7.5")
    .refine((value) => Number(value) > 0, "Capacity must be greater than 0"),
});

type CapacityFormValues = z.infer<typeof capacityFormSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Capacities are add-only: to change one, delete it and add the right value. */
export function CapacityFormDialog({ open, onClose }: Props) {
  const [formError, setFormError] = useState<string>();
  const create = useCreateCapacity();
  const form = useForm<CapacityFormValues>({
    resolver: zodResolver(capacityFormSchema),
    defaultValues: { capacityKg: "" },
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset({ capacityKg: "" });
      setFormError(undefined);
      create.reset();
    }
    // Only re-initialise when the dialog opens.
  }, [open]);

  const submit = form.handleSubmit((values) => {
    setFormError(undefined);
    create.mutate(Number(values.capacityKg), {
      onSuccess: onClose,
      onError: (error) =>
        setFormError(
          applyServerErrors(error, form.setError, ["capacityKg"], "Could not save capacity."),
        ),
    });
  });

  return (
    <FormDialog
      open={open}
      title="Add capacity"
      busy={create.isPending}
      onClose={onClose}
      onSubmit={submit}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {formError && <Alert severity="error">{formError}</Alert>}
        <TextField
          label="Capacity (kg)"
          required
          slotProps={{ htmlInput: { inputMode: "decimal" } }}
          {...form.register("capacityKg")}
          error={Boolean(errors.capacityKg)}
          helperText={errors.capacityKg?.message}
        />
      </Stack>
    </FormDialog>
  );
}
