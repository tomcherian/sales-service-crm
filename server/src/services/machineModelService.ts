import { MachineCapacity } from "../models/MachineCapacity.js";
import { MachineMake } from "../models/MachineMake.js";
import { MachineModel } from "../models/MachineModel.js";
import type {
  MachineModelCreateInput,
  MachineModelListInput,
  MachineModelUpdateInput,
} from "../validators/schemas.js";
import { ApiError } from "../utils/ApiError.js";

// A machine model may only use an active make from this same tenant.
async function verifyMake(companyId: string, makeId: string) {
  const make = await MachineMake.exists({
    _id: makeId,
    companyId,
    isActive: true,
  });
  if (!make) {
    throw new ApiError(400, "Validation failed", [
      { field: "make", message: "Selected make is invalid" },
    ]);
  }
}

// The capacity must be one of the tenant's capacity options.
async function verifyCapacity(companyId: string, capacityKg: number) {
  const capacity = await MachineCapacity.exists({ companyId, capacityKg });
  if (!capacity) {
    throw new ApiError(400, "Validation failed", [
      { field: "capacityKg", message: "Selected capacity is invalid" },
    ]);
  }
}

export async function listMachineModels(
  companyId: string,
  input: MachineModelListInput,
) {
  // Keep list filters tenant-scoped and treat search characters as literal text.
  const filter: Record<string, unknown> = { companyId };
  if (input.make) filter.make = input.make;
  if (input.type) filter.type = input.type;
  if (input.isActive !== undefined) filter.isActive = input.isActive;
  if (input.search) {
    const search = input.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // The make name lives in another collection, so resolve matching makes to IDs first.
    const makes = await MachineMake.find({
      companyId,
      name: { $regex: search, $options: "i" },
    })
      .select("_id")
      .lean();
    filter.$or = [
      { modelNumber: { $regex: search, $options: "i" } },
      { make: { $in: makes.map((make) => make._id) } },
    ];
  }

  const [items, total] = await Promise.all([
    MachineModel.find(filter)
      .populate("make", "name")
      .sort({ modelNumber: 1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean(),
    MachineModel.countDocuments(filter),
  ]);
  return { items, meta: { page: input.page, limit: input.limit, total } };
}

export async function getMachineModel(companyId: string, id: string) {
  const machineModel = await MachineModel.findOne({ _id: id, companyId })
    .populate("make", "name")
    .lean();
  if (!machineModel) throw new ApiError(404, "Machine model not found");
  return machineModel;
}

export async function createMachineModel(
  companyId: string,
  input: MachineModelCreateInput,
) {
  await verifyMake(companyId, input.make);
  await verifyCapacity(companyId, input.capacityKg);
  const machineModel = await MachineModel.create({ ...input, companyId });
  return getMachineModel(companyId, machineModel.id);
}

export async function updateMachineModel(
  companyId: string,
  id: string,
  input: MachineModelUpdateInput,
) {
  const current = await MachineModel.findOne({ _id: id, companyId }).lean();
  if (!current) throw new ApiError(404, "Machine model not found");

  // Only re-check values that change, so a machine whose make was deactivated
  // or whose capacity option was removed can still be edited.
  if (input.make !== undefined && input.make !== current.make.toString()) {
    await verifyMake(companyId, input.make);
  }
  if (
    input.capacityKg !== undefined &&
    input.capacityKg !== current.capacityKg
  ) {
    await verifyCapacity(companyId, input.capacityKg);
  }

  await MachineModel.updateOne(
    { _id: id, companyId },
    { $set: input },
    { runValidators: true },
  );
  return getMachineModel(companyId, id);
}

export async function deactivateMachineModel(companyId: string, id: string) {
  // Deactivation keeps the model available to historical sales that reference it.
  const machineModel = await MachineModel.findOneAndUpdate(
    { _id: id, companyId },
    { $set: { isActive: false } },
    { new: true },
  )
    .populate("make", "name")
    .lean();
  if (!machineModel) throw new ApiError(404, "Machine model not found");
  return machineModel;
}
