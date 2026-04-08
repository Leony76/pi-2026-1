import { NextFunction, Request, Response } from "express";

import { HttpError } from "./http-error";

export function notFoundHandler(_request: Request, response: Response): void {
  response.status(404).json({
    success: false,
    code: "not_found",
    message: "Route not found",
  });
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      details: error.details,
    });

    return;
  }

  response.status(500).json({
    success: false,
    code: "internal_server_error",
    message: "Internal server error",
  });
}
