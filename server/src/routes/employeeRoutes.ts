import { Router } from "express";
import {
  createEmployeeController,
  deactivateEmployeeController,
  getEmployeeController,
  listEmployeesController,
  updateEmployeeController,
} from "../controllers/employeeController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { tenant } from "../middleware/tenant.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.js";
import {
  employeeCreateSchema,
  employeeListSchema,
  employeeUpdateSchema,
  idParamsSchema,
} from "../validators/schemas.js";

export const employeeRoutes = Router();
employeeRoutes.use(authenticate, tenant, requireAdmin);

employeeRoutes.get(
  "/",
  validateQuery(employeeListSchema),
  listEmployeesController,
);
employeeRoutes.post(
  "/",
  validateBody(employeeCreateSchema),
  createEmployeeController,
);
employeeRoutes.get(
  "/:id",
  validateParams(idParamsSchema),
  getEmployeeController,
);
employeeRoutes.put(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(employeeUpdateSchema),
  updateEmployeeController,
);
employeeRoutes.delete(
  "/:id",
  validateParams(idParamsSchema),
  deactivateEmployeeController,
);
