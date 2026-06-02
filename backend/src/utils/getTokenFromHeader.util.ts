import { createHttpError } from "../lib/http-error";

export function getTokenFromHeader(authHeader?: string): string {
  if (!authHeader) {
    throw createHttpError(401, "unauthorized", "Cabecalho de autorizacao e requerivel!");
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw createHttpError(401, "unauthorized", "Cabecalho de autorizacao invalido!");
  }

  return token;
}