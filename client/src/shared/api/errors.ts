import { isAxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiErrorBody } from "./types";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return fallback;
}

/**
 * Puts server validation errors (`errors[].field`) on the matching form inputs.
 * Returns a message for anything that could not be attached to a field,
 * e.g. a 409 duplicate email or an error on a field the form doesn't render.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly Path<T>[],
  fallback: string,
): string | undefined {
  const fieldErrors = isAxiosError<ApiErrorBody>(error)
    ? (error.response?.data?.errors ?? [])
    : [];

  let unmatched = fieldErrors.length === 0;
  for (const item of fieldErrors) {
    const field = item.field as Path<T>;
    if (fieldNames.includes(field)) {
      setError(field, { type: "server", message: item.message });
    } else {
      unmatched = true;
    }
  }
  return unmatched ? getApiErrorMessage(error, fallback) : undefined;
}
