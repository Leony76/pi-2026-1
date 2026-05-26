import { AuthHandlers } from "@/types/auth/authHandlers.type";
import { ApiService } from "./api";
import { History } from "@/types/room/history.type";
import { Patient, PatientInfos } from "@/types/patient/patient.type";
import { CreatePatient } from "@/types/patient/createPatientWithAuth.type";

export class PatientService {

  public static async fetchActivePatients(
    auth   : AuthHandlers, 
    limit? : number
  ): Promise<Patient[]> {
    const query = 
      typeof limit === "number" 
      && limit > 0 
        ? `?limit=${limit}` 
        : ""
    ;
  
    return ApiService.getWithAuth<Patient[]>(
      `/patients/active${query}`,
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
  


  public static async fetchPatientHistory(
    auth   : AuthHandlers, 
    limit? : number
  ): Promise<History[]> {
    const query = 
      typeof limit === "number" 
      && limit > 0 
        ? `?limit=${limit}` 
        : ""
    ;
  
    return ApiService.getWithAuth<History[]>(
      `/patients/history${query}`,
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
  


  public static async fetchPatientById(
    id   : string, 
    auth : AuthHandlers
  ): Promise<PatientInfos> {
    return ApiService.getWithAuth<PatientInfos>(
      `/patients/${id}`,
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
  


  public static async createPatient(
    data : CreatePatient,
    auth : AuthHandlers
  ): Promise<{ id: string }> {
    return ApiService.postWithAuth<{ id: string }>(
      "/patients",
      data,
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
}

