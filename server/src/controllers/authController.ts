import type { RequestHandler } from "express";
import { login, getCurrentUser } from "../services/authService.js";

// Keep HTTP handling thin; authentication and response shaping belong to the service.
export const loginController: RequestHandler = async (request, response) => {
  const result = await login(request.body.email, request.body.password);
  response.json({ success: true, data: result });
};

export const meController: RequestHandler = async (request, response) => {
  const auth = request.auth!;
  const user = await getCurrentUser(auth.userId, auth.companyId);
  response.json({ success: true, data: user });
};
