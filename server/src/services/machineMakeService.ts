import { MachineMake } from "../models/MachineMake.js";
import type {
  MachineMakeCreateInput,
  MachineMakeListInput,
  MachineMakeUpdateInput,
} from "../validators/schemas.js";
import { ApiError } from "../utils/ApiError.js";

export async function listMachineMakes(
  companyId: string,
  input: MachineMakeListInput,
) {
  // Keep list filters tenant-scoped and treat search characters as literal text.
  const filter: Record<string, unknown> = { companyId };
  if (input.isActive !== undefined) filter.isActive = input.isActive;
  if (input.search) {
    const search = input.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    MachineMake.find(filter)
      .sort({ name: 1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean(),
    MachineMake.countDocuments(filter),
  ]);
  return { items, meta: { page: input.page, limit: input.limit, total } };
}

export async function getMachineMake(companyId: string, id: string) {
  const make = await MachineMake.findOne({ _id: id, companyId }).lean();
  if (!make) throw new ApiError(404, "Make not found");
  return make;
}

export async function createMachineMake(
  companyId: string,
  input: MachineMakeCreateInput,
) {
  const make = await MachineMake.create({ ...input, companyId });
  return getMachineMake(companyId, make.id);
}

export async function updateMachineMake(
  companyId: string,
  id: string,
  input: MachineMakeUpdateInput,
) {
  const make = await MachineMake.findOneAndUpdate(
    { _id: id, companyId },
    { $set: input },
    { new: true, runValidators: true },
  ).lean();
  if (!make) throw new ApiError(404, "Make not found");
  return make;
}

export async function deactivateMachineMake(companyId: string, id: string) {
  // Machine models keep pointing at a deactivated make; it just can't be picked for new ones.
  const make = await MachineMake.findOneAndUpdate(
    { _id: id, companyId },
    { $set: { isActive: false } },
    { new: true },
  ).lean();
  if (!make) throw new ApiError(404, "Make not found");
  return make;
}
