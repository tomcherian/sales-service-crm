import { useEffect, useState } from "react";
import { Alert, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@/shared/api/errors";
import { FormDialog } from "@/shared/ui/FormDialog";
import { useSaveMake } from "../hooks/useMakes";
import {
  makeFormFields,
  makeFormSchema,
  toMakeFormValues,
  toMakePayload,
  type MakeFormValues,
} from "../model/makeForm";
import type { Make } from "../model/types";

interface Props {
  open: boolean;
  make: Make | null;
  onClose: () => void;
}

export function MakeFormDialog({ open, make, onClose }: Props) {
  const [formError, setFormError] = useState<string>();
  const save = useSaveMake();
  const form = useForm<MakeFormValues>({
    resolver: zodResolver(makeFormSchema),
    defaultValues: toMakeFormValues(null),
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset(toMakeFormValues(make));
      setFormError(undefined);
      save.reset();
    }
    // Only re-initialise when the dialog opens for a (different) make.
  }, [open, make]);

  const submit = form.handleSubmit((values) => {
    setFormError(undefined);
    save.mutate(
      { id: make?.id, payload: toMakePayload(values) },
      {
        onSuccess: onClose,
        onError: (error) =>
          setFormError(
            applyServerErrors(error, form.setError, makeFormFields, "Could not save make."),
          ),
      },
    );
  });

  return (
    <FormDialog
      open={open}
      title={make ? "Edit make" : "Add make"}
      busy={save.isPending}
      onClose={onClose}
      onSubmit={submit}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {formError && <Alert severity="error">{formError}</Alert>}
        <TextField
          label="Make"
          required
          {...form.register("name")}
          error={Boolean(errors.name)}
          helperText={errors.name?.message ?? "The brand on the machine, e.g. Samsung"}
        />
        <TextField
          label="Company name"
          {...form.register("companyName")}
          error={Boolean(errors.companyName)}
          helperText={errors.companyName?.message ?? "The manufacturer, e.g. Samsung Electronics Co., Ltd."}
        />
        <TextField
          label="Country"
          {...form.register("country")}
          error={Boolean(errors.country)}
          helperText={errors.country?.message}
        />
      </Stack>
    </FormDialog>
  );
}
