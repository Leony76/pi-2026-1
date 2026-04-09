import crypto from "crypto";
import jwt from "jsonwebtoken";

import { createHttpError } from "./http-error";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  kind: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  kind: "refresh";
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw createHttpError(500, "internal_server_error", "JWT_SECRET não configurado!");
  }

  return secret;
}

export function generateAccessToken(userId: string, email: string): string {
  const payload: AccessTokenPayload = {
    sub: userId,
    email,
    kind: "access",
  };

  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, getJwtSecret()) as AccessTokenPayload;

  if (payload.kind !== "access") {
    throw createHttpError(401, "unauthorized", "Token de acesso inválido!");
  }

  return payload;
}

export function generateOpaqueToken(byteLength = 48): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
