import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const requireAdmin: RequestHandler = (request, _response, next) => {
  if (request.auth?.role !== "admin") {
    next(new ApiError(403, "Admin access required"));
    return;
  }
  next();
};
