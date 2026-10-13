import type { RequestHandler } from "express";
import {
  createMachineMake,
  deactivateMachineMake,
  getMachineMake,
  listMachineMakes,
  updateMachineMake,
} from "../services/machineMakeService.js";
import { machineMakeListSchema } from "../validators/schemas.js";

// Controllers pass the tenant derived by middleware, never a client-supplied company ID.
export const listMachineMakesController: RequestHandler = async (
  request,
  response,
) => {
  const query = machineMakeListSchema.parse(request.query);
  const result = await listMachineMakes(request.companyId!, query);
  response.json({ success: true, data: result.items, meta: result.meta });
};

export const getMachineMakeController: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  response.json({
    success: true,
    data: await getMachineMake(request.companyId!, request.params.id!),
  });
};

export const createMachineMakeController: RequestHandler = async (
  request,
  response,
) => {
  const make = await createMachineMake(request.companyId!, request.body);
  response.status(201).json({ success: true, data: make });
};

export const updateMachineMakeController: RequestHandler<{
  id: string;
}> = async (request, response) => {
  const make = await updateMachineMake(
    request.companyId!,
    request.params.id!,
    request.body,
  );
  response.json({ success: true, data: make });
};

export const deactivateMachineMakeController: RequestHandler<{
  id: string;
}> = async (request, response) => {
  const make = await deactivateMachineMake(
    request.companyId!,
    request.params.id!,
  );
  response.json({ success: true, data: make });
};
