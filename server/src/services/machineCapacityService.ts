import { MachineCapacity } from "../models/MachineCapacity.js";
import type {
  MachineCapacityCreateInput,
  MachineCapacityListInput,
} from "../validators/schemas.js";
import { ApiError } from "../utils/ApiError.js";

export async function listMachineCapacities(
  companyId: string,
  input: MachineCapacityListInput,
) {
  const filter: Record<string, unknown> = { companyId };
  if (input.search) {
    // Capacities are numbers, so search is an exact match; anything non-numeric matches nothing.
    const value = Number(input.search);
    filter.capacityKg = Number.isFinite(value) ? value : -1;
  }

  const [items, total] = await Promise.all([
    MachineCapacity.find(filter)
      .sort({ capacityKg: 1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean(),
    MachineCapacity.countDocuments(filter),
  ]);
  return { items, meta: { page: input.page, limit: input.limit, total } };
}

export async function createMachineCapacity(
  companyId: string,
  input: MachineCapacityCreateInput,
) {
  const capacity = await MachineCapacity.create({ ...input, companyId });
  return capacity.toObject();
}

export async function deleteMachineCapacity(companyId: string, id: string) {
  // Safe to hard-delete: machine models store the capacity number, not a reference to this record.
  const capacity = await MachineCapacity.findOneAndDelete({
    _id: id,
    companyId,
  }).lean();
  if (!capacity) throw new ApiError(404, "Capacity not found");
  return capacity;
}
