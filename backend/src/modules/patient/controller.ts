import { NextFunction, Request, Response } from "express";
import { PatientService } from "./service";
import { sendSuccessResponse } from "../../lib/auth-response";
import { createHttpError } from "../../lib/http-error";
import { getAuthPayload } from "../../utils/getAuthPayload.util";
import { parseLimit } from "../../utils/parseLimit.util";

export class PatientController {

	public static async listActivePatients(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const payload = getAuthPayload(request);
			const limit = parseLimit(request.query.limit);

			const patients = await PatientService.getActivePatients(payload.sub, limit);
	
			sendSuccessResponse(response, 200, patients);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async listPatientHistory(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const payload = getAuthPayload(request);
			const limit = parseLimit(request.query.limit);
			const history = await PatientService.getPatientHistory(payload.sub, limit);
	
			sendSuccessResponse(response, 200, history);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async getPatientById(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const payload = getAuthPayload(request);
			const patientId = request.params.id;
	
			if (!patientId) {
				throw createHttpError(400, "bad_request", "Parametro id invalido.");
			}
	
			const patient = await PatientService.getPatientById(payload.sub, String(patientId));
	
			if (!patient) {
				throw createHttpError(404, "not_found", "Paciente nao encontrado.");
			}
	
			sendSuccessResponse(response, 200, patient);
		} catch (error) {
			next(error);
		}
	}
	
	
	
	public static async createPatient(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const payload = getAuthPayload(request);
			const patient = await PatientService.createPatient(payload.sub, request.body);
	
			sendSuccessResponse(response, 201, patient);
		} catch (error) {
			next(error);
		}
	}
}

