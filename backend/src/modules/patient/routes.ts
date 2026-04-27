import { Router } from "express";

import {
	createPatientController,
	getPatientByIdController,
	listActivePatientsController,
	listPatientHistoryController,
} from "./controller";

const patientRoutes = Router();

patientRoutes.get("/active", listActivePatientsController);
patientRoutes.get("/history", listPatientHistoryController);
patientRoutes.get("/:id", getPatientByIdController);
patientRoutes.post("/", createPatientController);

export default patientRoutes;
