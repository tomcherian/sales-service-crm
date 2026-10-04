import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { User } from "../models/User.js";
import type {
  EmployeeCreateInput,
  EmployeeListInput,
  EmployeeUpdateInput,
} from "../validators/schemas.js";
import { ApiError } from "../utils/ApiError.js";

function normalizeTeamLead(value: string | null | undefined) {
  return value ? new Types.ObjectId(value) : undefined;
}

// Prevent cross-tenant, inactive, or incorrectly typed team-lead assignments.
async function verifyTeamLead(
  companyId: string,
  teamLeadId: string | null | undefined,
  role?: string,
) {
  if (!teamLeadId) return;
  const lead = await User.exists({
    _id: teamLeadId,
    companyId,
    role: "team_lead",
    isActive: true,
  });
  if (!lead) throw new ApiError(400, "Selected team lead is invalid");
  if (role && role !== "salesperson")
    throw new ApiError(400, "Only salespersons can have a team lead");
}

export async function listEmployees(
  companyId: string,
  input: EmployeeListInput,
) {
  // Start with the tenant predicate so every optional list filter remains tenant-scoped.
  const filter: Record<string, unknown> = { companyId };
  if (input.role) filter.role = input.role;
  if (input.search) {
    const search = input.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ name: 1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  return { items, meta: { page: input.page, limit: input.limit, total } };
}

export async function getEmployee(companyId: string, id: string) {
  const employee = await User.findOne({ _id: id, companyId })
    .select("-passwordHash")
    .lean();
  if (!employee) throw new ApiError(404, "Employee not found");
  return employee;
}

export async function createEmployee(
  companyId: string,
  input: EmployeeCreateInput,
) {
  await verifyTeamLead(companyId, input.teamLead, input.role);
  // Store only a password hash, and use the safe detail query for the response.
  const employee = await User.create({
    companyId,
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    passwordHash: await bcrypt.hash(input.password, 10),
    role: input.role,
    ...(input.teamLead ? { teamLead: normalizeTeamLead(input.teamLead) } : {}),
  });
  return getEmployee(companyId, employee.id);
}

export async function updateEmployee(
  companyId: string,
  id: string,
  input: EmployeeUpdateInput,
) {
  const current = await User.findOne({ _id: id, companyId })
    .select("+passwordHash")
    .exec();
  if (!current) throw new ApiError(404, "Employee not found");

  const nextRole = input.role ?? current.role;
  // Partial updates keep the current lead unless the request explicitly changes it.
  const leadId =
    input.teamLead === undefined
      ? current.teamLead?.toString()
      : input.teamLead || undefined;

  await verifyTeamLead(companyId, leadId, nextRole);

  if (input.name !== undefined) current.name = input.name;
  if (input.email !== undefined) current.email = input.email.toLowerCase();
  if (input.phone !== undefined) current.phone = input.phone;
  if (input.password)
    current.passwordHash = await bcrypt.hash(input.password, 10);
  if (input.role !== undefined) current.role = input.role;
  if (input.isActive !== undefined) current.isActive = input.isActive;
  if (input.teamLead !== undefined) {
    current.teamLead = input.teamLead
      ? new Types.ObjectId(input.teamLead)
      : undefined;
  }
  if (nextRole !== "salesperson") current.teamLead = undefined;

  await current.save();
  return getEmployee(companyId, id);
}

export async function deactivateEmployee(
  companyId: string,
  id: string,
  actingUserId: string,
) {
  // Deactivation preserves references from customer assignments and historical records.
  if (id === actingUserId)
    throw new ApiError(400, "You cannot deactivate your own account");
  const employee = await User.findOneAndUpdate(
    { _id: id, companyId },
    { $set: { isActive: false } },
    { new: true },
  )
    .select("-passwordHash")
    .lean();

  if (!employee) throw new ApiError(404, "Employee not found");
  return employee;
}
