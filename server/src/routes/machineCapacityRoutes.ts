import { Router } from "express";
import {
  createMachineCapacityController,
  deleteMachineCapacityController,
  listMachineCapacitiesController,
} from "../controllers/machineCapacityController.js";
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
  machineCapacityCreateSchema,
  machineCapacityListSchema,
} from "../validators/schemas.js";

export const machineCapacityRoutes = Router();
machineCapacityRoutes.use(authenticate, tenant, requireAdmin);

machineCapacityRoutes.get(
  "/",
  validateQuery(machineCapacityListSchema),
  listMachineCapacitiesController,
);
machineCapacityRoutes.post(
  "/",
  validateBody(machineCapacityCreateSchema),
  createMachineCapacityController,
);
machineCapacityRoutes.delete(
  "/:id",
  validateParams(idParamsSchema),
  deleteMachineCapacityController,
);
