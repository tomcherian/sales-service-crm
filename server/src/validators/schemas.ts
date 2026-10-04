import { z } from "zod";
import { USER_ROLES } from "../models/User.js";

const optionalText = z.string().trim().max(500).optional();
const optionalEmail = z
  .union([z.string().trim().email(), z.literal("")])
  .optional();

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const idParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID"),
});

export const employeeCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(12).max(128),
  phone: optionalText,
  role: z.enum(USER_ROLES),
  teamLead: z
    .union([z.string().regex(/^[a-f\d]{24}$/i), z.literal("")])
    .optional(),
});

export const employeeUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(12).max(128).optional(),
  phone: optionalText,
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
  teamLead: z
    .union([z.string().regex(/^[a-f\d]{24}$/i), z.literal(""), z.null()])
    .optional(),
});

export const employeeListSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).optional(),
});

export const customerCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  type: z.enum(["retail", "wholesale"]),
  email: optionalEmail,
  phone: optionalText,
  country: optionalText,
  city: optionalText,
  address: optionalText,
  assignedSalesperson: z
    .union([z.string().regex(/^[a-f\d]{24}$/i), z.literal("")])
    .optional(),
  notes: optionalText,
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customerListSchema = z.object({
  type: z.enum(["retail", "wholesale"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).optional(),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type EmployeeListInput = z.infer<typeof employeeListSchema>;
export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type CustomerListInput = z.infer<typeof customerListSchema>;
