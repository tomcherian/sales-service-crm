import { Router } from "express";
import {
  createMachineModelController,
  deactivateMachineModelController,
  getMachineModelController,
  listMachineModelsController,
  updateMachineModelController,
} from "../controllers/machineModelController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { tenant } from "../middleware/tenant.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.js";
import {
  idParamsSchema,
  machineModelCreateSchema,
  machineModelListSchema,
  machineModelUpdateSchema,
} from "../validators/schemas.js";

export const machineModelRoutes = Router();
machineModelRoutes.use(authenticate, tenant, requireAdmin);

machineModelRoutes.get(
  "/",
  validateQuery(machineModelListSchema),
  listMachineModelsController,
);
machineModelRoutes.post(
  "/",
  validateBody(machineModelCreateSchema),
  createMachineModelController,
);
machineModelRoutes.get(
  "/:id",
  validateParams(idParamsSchema),
  getMachineModelController,
);
machineModelRoutes.put(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(machineModelUpdateSchema),
  updateMachineModelController,
);
machineModelRoutes.delete(
  "/:id",
  validateParams(idParamsSchema),
  deactivateMachineModelController,
);
