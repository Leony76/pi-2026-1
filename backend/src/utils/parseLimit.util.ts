import { createHttpError } from "../lib/http-error";

export function parseLimit(rawLimit: unknown): number | undefined {
  if (typeof rawLimit !== "string" || rawLimit.trim() === "") {
    return undefined;
  }

  const parsedLimit = Number(rawLimit);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    throw createHttpError(400, "bad_request", "Parametro limit invalido.");
  }

  return parsedLimit;
}