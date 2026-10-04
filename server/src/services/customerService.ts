import { Types } from "mongoose";
import { Customer } from "../models/Customer.js";
import { User } from "../models/User.js";
import type {
  CustomerCreateInput,
  CustomerListInput,
  CustomerUpdateInput,
} from "../validators/schemas.js";
import { ApiError } from "../utils/ApiError.js";

async function verifySalesperson(
  companyId: string,
  id: string | null | undefined,
) {
  // A salesperson assignment must refer to an active user in this same tenant.
  if (!id) return;
  const user = await User.exists({
    _id: id,
    companyId,
    role: "salesperson",
    isActive: true,
  });
  if (!user) throw new ApiError(400, "Assigned salesperson is invalid");
}

function cleanInput(input: CustomerCreateInput | CustomerUpdateInput) {
  const value = { ...input };
  if (value.assignedSalesperson === "") value.assignedSalesperson = undefined;
  return value;
}

export async function listCustomers(
  companyId: string,
  input: CustomerListInput,
) {
  // Keep list filters tenant-scoped and treat search characters as literal text.
  const filter: Record<string, unknown> = { companyId };
  if (input.type) filter.type = input.type;
  if (input.search) {
    const search = input.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Customer.find(filter)
      .sort({ name: 1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean(),
    Customer.countDocuments(filter),
  ]);
  return { items, meta: { page: input.page, limit: input.limit, total } };
}

export async function getCustomer(companyId: string, id: string) {
  const customer = await Customer.findOne({ _id: id, companyId }).lean();
  if (!customer) throw new ApiError(404, "Customer not found");
  return customer;
}

export async function createCustomer(
  companyId: string,
  rawInput: CustomerCreateInput,
) {
  const input = cleanInput(rawInput);
  await verifySalesperson(companyId, input.assignedSalesperson);
  const customer = await Customer.create({
    ...input,
    companyId,
    ...(input.assignedSalesperson
      ? { assignedSalesperson: new Types.ObjectId(input.assignedSalesperson) }
      : {}),
  });
  return getCustomer(companyId, customer.id);
}

export async function updateCustomer(
  companyId: string,
  id: string,
  rawInput: CustomerUpdateInput,
) {
  const input = cleanInput(rawInput);
  if (rawInput.assignedSalesperson) {
    await verifySalesperson(companyId, input.assignedSalesperson);
  }
  const update: Record<string, unknown> = { ...input };
  const unset: Record<string, 1> = {};
  if (rawInput.assignedSalesperson === "") {
    // An empty value is the API's explicit request to remove the assignment.
    delete update.assignedSalesperson;
    unset.assignedSalesperson = 1;
  } else if (input.assignedSalesperson) {
    update.assignedSalesperson = new Types.ObjectId(
      input.assignedSalesperson,
    );
  }

  const customer = await Customer.findOneAndUpdate(
    { _id: id, companyId },
    {
      ...(Object.keys(update).length ? { $set: update } : {}),
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    },
    { new: true, runValidators: true },
  ).lean();

  if (!customer) throw new ApiError(404, "Customer not found");
  return customer;
}

export async function deleteCustomer(companyId: string, id: string) {
  const customer = await Customer.findOneAndDelete({
    _id: id,
    companyId,
  }).lean();
  if (!customer) throw new ApiError(404, "Customer not found");
  return customer;
}
