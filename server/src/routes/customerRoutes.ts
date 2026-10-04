import { Router } from "express";
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerController,
  listCustomersController,
  updateCustomerController,
} from "../controllers/customerController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { tenant } from "../middleware/tenant.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.js";
import {
  customerCreateSchema,
  customerListSchema,
  customerUpdateSchema,
  idParamsSchema,
} from "../validators/schemas.js";

export const customerRoutes = Router();
customerRoutes.use(authenticate, tenant, requireAdmin);

customerRoutes.get(
  "/",
  validateQuery(customerListSchema),
  listCustomersController,
);
customerRoutes.post(
  "/",
  validateBody(customerCreateSchema),
  createCustomerController,
);
customerRoutes.get(
  "/:id",
  validateParams(idParamsSchema),
  getCustomerController,
);
customerRoutes.put(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(customerUpdateSchema),
  updateCustomerController,
);
customerRoutes.delete(
  "/:id",
  validateParams(idParamsSchema),
  deleteCustomerController,
);
