import { Router } from "express";
import { PatientController } from "./controller";

const patientRoutes = Router();

patientRoutes.get("/active"  , PatientController.listActivePatients);
patientRoutes.get("/history" , PatientController.listPatientHistory);
patientRoutes.get("/:id"     , PatientController.getPatientById);
patientRoutes.post("/"       , PatientController.createPatient);

export default patientRoutes;
