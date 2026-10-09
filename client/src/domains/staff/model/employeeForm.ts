import { z } from "zod";
import type { EmployeePayload } from "../api/staffApi";
import type { Employee, StaffRole } from "./types";

export const MIN_PASSWORD_LENGTH = 12;

export const employeeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string(),
  phone: z.string(),
  teamLead: z.string(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const employeeFormFields = [
  "name",
  "email",
  "password",
  "phone",
  "teamLead",
] as const satisfies readonly (keyof EmployeeFormValues)[];

export const emptyEmployeeForm: EmployeeFormValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
  teamLead: "",
};

export function toEmployeeFormValues(employee: Employee | null): EmployeeFormValues {
  if (!employee) return emptyEmployeeForm;
  return {
    name: employee.name,
    email: employee.email,
    password: "",
    phone: employee.phone ?? "",
    teamLead: employee.teamLeadId ?? "",
  };
}

/** A password is required on create; on edit, blank means "keep the current one". */
export function getPasswordError(password: string, isEditing: boolean) {
  if (!password) {
    return isEditing ? undefined : "A password is required when creating an employee";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return undefined;
}

export function toEmployeePayload(
  values: EmployeeFormValues,
  role: StaffRole,
): EmployeePayload {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    role,
    ...(values.password ? { password: values.password } : {}),
    ...(role === "salesperson" && values.teamLead ? { teamLead: values.teamLead } : {}),
  };
}
