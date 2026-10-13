import type { RequestHandler } from "express";
import {
  createMachineCapacity,
  deleteMachineCapacity,
  listMachineCapacities,
} from "../services/machineCapacityService.js";
import { machineCapacityListSchema } from "../validators/schemas.js";

// Controllers pass the tenant derived by middleware, never a client-supplied company ID.
export const listMachineCapacitiesController: RequestHandler = async (
  request,
  response,
) => {
  const query = machineCapacityListSchema.parse(request.query);
  const result = await listMachineCapacities(request.companyId!, query);
  response.json({ success: true, data: result.items, meta: result.meta });
};

export const createMachineCapacityController: RequestHandler = async (
  request,
  response,
) => {
  const capacity = await createMachineCapacity(
    request.companyId!,
    request.body,
  );
  response.status(201).json({ success: true, data: capacity });
};

export const deleteMachineCapacityController: RequestHandler<{
  id: string;
}> = async (request, response) => {
  await deleteMachineCapacity(request.companyId!, request.params.id!);
  response.json({ success: true, data: { deleted: true } });
};
