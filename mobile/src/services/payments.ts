import { AuthHandlers } from "@/types/auth/authHandlers.type";
import { FetchProfessionalPaymentsHistory } from "@/types/payment/fetchProfessionalPaymentsHistory.type";
import { StorePaymentHistory } from "@/types/payment/storePaymentHistory.type";
import { ApiService } from "./api";

export class PaymentService {

  public static async storePaymentAtPaymentsHistory(
    data : StorePaymentHistory,
    auth : AuthHandlers,
  ) {
    return ApiService.postWithAuth<StorePaymentHistory>(
      '/users/payments/storage', {
        professionalId: data.professionalId,
        from: data.from,
        paymentMethod: data.paymentMethod,
        paid: data.paid,
      }, 
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut	
    )
  }	
  


  public static async fetchLoggedProfessionalPaymentsHistory(
    professionalId : string, 
    auth           : AuthHandlers
  ): Promise<FetchProfessionalPaymentsHistory[]> {
    return ApiService.getWithAuth<FetchProfessionalPaymentsHistory[]>(
      `/users/payments/${professionalId}`,
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
}