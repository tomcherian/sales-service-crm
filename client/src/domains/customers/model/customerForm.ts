import { z } from "zod";
import type { CustomerPayload } from "../api/customersApi";
import type { Customer } from "./types";

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  type: z.enum(["retail", "wholesale"]),
  email: z.union([z.string().trim().email("Enter a valid email"), z.literal("")]),
  phone: z.string().trim(),
  country: z.string().trim(),
  city: z.string().trim(),
  address: z.string().trim(),
  assignedSalesperson: z.string(),
  notes: z.string().trim(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const customerFormFields = [
  "name",
  "type",
  "email",
  "phone",
  "country",
  "city",
  "address",
  "assignedSalesperson",
  "notes",
] as const satisfies readonly (keyof CustomerFormValues)[];

export const emptyCustomerForm: CustomerFormValues = {
  name: "",
  type: "retail",
  email: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  assignedSalesperson: "",
  notes: "",
};

export function toCustomerFormValues(customer: Customer | null): CustomerFormValues {
  if (!customer) return emptyCustomerForm;
  return {
    name: customer.name,
    type: customer.type,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    country: customer.country ?? "",
    city: customer.city ?? "",
    address: customer.address ?? "",
    assignedSalesperson: customer.assignedSalespersonId ?? "",
    notes: customer.notes ?? "",
  };
}

// Empty strings are sent as-is: on update the server treats "" as "clear this field",
// including removing the salesperson assignment.
export function toCustomerPayload(values: CustomerFormValues): CustomerPayload {
  return values;
}
