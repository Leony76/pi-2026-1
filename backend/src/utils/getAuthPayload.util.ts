import { Request } from "express";
import { AuthPayload } from "../types/auth/authPayload.type";
import { getJwtSecret } from "./getJwtSecret.util";
import { getTokenFromHeader } from "./getTokenFromHeader.util";
import jwt from "jsonwebtoken";

export function getAuthPayload(request: Request): AuthPayload {
	const token = getTokenFromHeader(request.headers.authorization);
	return jwt.verify(token, getJwtSecret()) as AuthPayload;
}