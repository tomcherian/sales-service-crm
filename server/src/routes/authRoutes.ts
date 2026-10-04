import { Router } from "express";
import {
  loginController,
  meController,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { tenant } from "../middleware/tenant.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema } from "../validators/schemas.js";

export const authRoutes = Router();

authRoutes.post("/login", validateBody(loginSchema), loginController);
authRoutes.get("/me", authenticate, tenant, meController);
