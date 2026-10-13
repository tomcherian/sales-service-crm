import { Router } from "express";
import {
  createMachineMakeController,
  deactivateMachineMakeController,
  getMachineMakeController,
  listMachineMakesController,
  updateMachineMakeController,
} from "../controllers/machineMakeController.js";
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
  machineMakeCreateSchema,
  machineMakeListSchema,
  machineMakeUpdateSchema,
} from "../validators/schemas.js";

export const machineMakeRoutes = Router();
machineMakeRoutes.use(authenticate, tenant, requireAdmin);

machineMakeRoutes.get(
  "/",
  validateQuery(machineMakeListSchema),
  listMachineMakesController,
);
machineMakeRoutes.post(
  "/",
  validateBody(machineMakeCreateSchema),
  createMachineMakeController,
);
machineMakeRoutes.get(
  "/:id",
  validateParams(idParamsSchema),
  getMachineMakeController,
);
machineMakeRoutes.put(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(machineMakeUpdateSchema),
  updateMachineMakeController,
);
machineMakeRoutes.delete(
  "/:id",
  validateParams(idParamsSchema),
  deactivateMachineMakeController,
);
