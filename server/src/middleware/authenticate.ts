import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate: RequestHandler = asyncHandler(
  async (request, _response, next) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    let payload: string | JwtPayload;
    try {
      payload = jwt.verify(authorization.slice(7), env.JWT_SECRET);
    } catch {
      throw new ApiError(401, "Invalid or expired token");
    }

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.companyId !== "string"
    ) {
      throw new ApiError(401, "Invalid token");
    }

    const user = await User.findOne({
      _id: payload.sub,
      companyId: payload.companyId,
      isActive: true,
    })
      .select("_id companyId role")
      .lean();

    if (!user) {
      throw new ApiError(401, "Account is inactive or no longer exists");
    }

    request.auth = {
      userId: user._id.toString(),
      companyId: user.companyId.toString(),
      role: user.role,
    };
    next();
  },
);
