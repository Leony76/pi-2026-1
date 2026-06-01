import { AuthHandlers } from "@/types/auth/authHandlers.type";
import { EnterpriseDashboardResponse } from "@/types/metrics/enterpriseDashboardResponse.type";
import { ApiService } from "./api";
import { EnterpriseValuesResponse } from "@/types/metrics/enterpriseValuesResponse.type";

export class EnterpriseService {

  public static async fetchEnterpriseDashboard(
    auth: AuthHandlers
  ): Promise<EnterpriseDashboardResponse> {
    return ApiService.getWithAuth<EnterpriseDashboardResponse>(
      "/rooms/dashboard",
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
    


  public static async fetchEnterpriseValues(
    auth: AuthHandlers
  ): Promise<EnterpriseValuesResponse> {
    return ApiService.getWithAuth<EnterpriseValuesResponse>(
      "/rooms/values",
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
}