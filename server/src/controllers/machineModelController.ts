import type { RequestHandler } from "express";
import {
  createMachineModel,
  deactivateMachineModel,
  getMachineModel,
  listMachineModels,
  updateMachineModel,
} from "../services/machineModelService.js";
import { machineModelListSchema } from "../validators/schemas.js";

// Controllers pass the tenant derived by middleware, never a client-supplied company ID.
export const listMachineModelsController: RequestHandler = async (
  request,
  response,
) => {
  const query = machineModelListSchema.parse(request.query);
  const result = await listMachineModels(request.companyId!, query);
  response.json({ success: true, data: result.items, meta: result.meta });
};

export const getMachineModelController: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  response.json({
    success: true,
    data: await getMachineModel(request.companyId!, request.params.id!),
  });
};

export const createMachineModelController: RequestHandler = async (
  request,
  response,
) => {
  const machineModel = await createMachineModel(
    request.companyId!,
    request.body,
  );
  response.status(201).json({ success: true, data: machineModel });
};

export const updateMachineModelController: RequestHandler<{
  id: string;
}> = async (request, response) => {
  const machineModel = await updateMachineModel(
    request.companyId!,
    request.params.id!,
    request.body,
  );
  response.json({ success: true, data: machineModel });
};

export const deactivateMachineModelController: RequestHandler<{
  id: string;
}> = async (request, response) => {
  const machineModel = await deactivateMachineModel(
    request.companyId!,
    request.params.id!,
  );
  response.json({ success: true, data: machineModel });
};
