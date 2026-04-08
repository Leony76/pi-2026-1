import { Request, Response, NextFunction } from "express";

import { login, register } from "./service";

export async function registerController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await register(request.body);
		response.status(201).json(result);
	} catch (error) {
		next(error);
	}
}

export async function loginController(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const result = await login(request.body);
		response.status(200).json(result);
	} catch (error) {
		next(error);
	}
}
