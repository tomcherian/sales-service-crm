import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const tenant: RequestHandler = (request, _response, next) => {
  if (!request.auth?.companyId) {
    next(new ApiError(401, "Authentication required"));
    return;
  }
  request.companyId = request.auth.companyId;
  next();
};
