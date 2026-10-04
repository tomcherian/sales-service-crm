import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details ? { errors: error.details } : {}),
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    response
      .status(400)
      .json({ success: false, message: "Invalid identifier" });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    response
      .status(409)
      .json({
        success: false,
        message: "A record with that value already exists",
      });
    return;
  }

  console.error(error);
  response
    .status(500)
    .json({ success: false, message: "Internal server error" });
};
