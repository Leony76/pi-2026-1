import { createHttpError } from "../lib/http-error";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw createHttpError(500, "internal_server_error", "JWT_SECRET nao configurado!");
  }

  return secret;
}