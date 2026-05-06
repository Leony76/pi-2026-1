import { apiGetWithAuth, apiPostWithAuth } from "./auth-api";
import { History } from "@/types/history.type";
import { Patient, PatientInfos } from "@/types/patient.type";

type AuthHandlers = {
  token: string;
  refreshToken: string;
  updateTokens: (token: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export async function fetchActivePatientsWithAuth(auth: AuthHandlers, limit?: number): Promise<Patient[]> {
  const query = typeof limit === "number" && limit > 0 ? `?limit=${limit}` : "";

  return apiGetWithAuth<Patient[]>(
    `/patients/active${query}`,
    auth.token,
    auth.refreshToken,
    auth.updateTokens,
    auth.signOut
  );
}

export async function fetchPatientHistoryWithAuth(auth: AuthHandlers, limit?: number): Promise<History[]> {
  const query = typeof limit === "number" && limit > 0 ? `?limit=${limit}` : "";

  return apiGetWithAuth<History[]>(
    `/patients/history${query}`,
    auth.token,
    auth.refreshToken,
    auth.updateTokens,
    auth.signOut
  );
}

export async function fetchPatientByIdWithAuth(id: string, auth: AuthHandlers): Promise<PatientInfos> {
  return apiGetWithAuth<PatientInfos>(
    `/patients/${id}`,
    auth.token,
    auth.refreshToken,
    auth.updateTokens,
    auth.signOut
  );
}

export async function createPatientWithAuth(
  data: {
    name: string;
    phone: string;
    email?: string;
    initialDate: string;
    initialHour: string;
    observations?: string;
  },
  auth: AuthHandlers
): Promise<{ id: string }> {
  return apiPostWithAuth<{ id: string }>(
    "/patients",
    data,
    auth.token,
    auth.refreshToken,
    auth.updateTokens,
    auth.signOut
  );
}
