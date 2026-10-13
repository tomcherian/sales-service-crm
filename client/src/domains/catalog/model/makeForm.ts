import { z } from "zod";
import type { MakePayload } from "../api/makesApi";
import type { Make } from "./types";

export const makeFormSchema = z.object({
  name: z.string().trim().min(1, "Make is required").max(80),
  companyName: z.string().trim().max(500),
  country: z.string().trim().max(500),
});

export type MakeFormValues = z.infer<typeof makeFormSchema>;

export const makeFormFields = [
  "name",
  "companyName",
  "country",
] as const satisfies readonly (keyof MakeFormValues)[];

export const emptyMakeForm: MakeFormValues = { name: "", companyName: "", country: "" };

export function toMakeFormValues(make: Make | null): MakeFormValues {
  if (!make) return emptyMakeForm;
  return {
    name: make.name,
    companyName: make.companyName ?? "",
    country: make.country ?? "",
  };
}

// Empty strings are sent as-is so that clearing a field on edit clears it on the server.
export function toMakePayload(values: MakeFormValues): MakePayload {
  return values;
}
