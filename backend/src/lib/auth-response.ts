import { Response } from "express";

export function sendSuccessResponse<T>(
  response: Response,
  statusCode: number,
  data: T,
): Response {
  return response.status(statusCode).json(data);
}
