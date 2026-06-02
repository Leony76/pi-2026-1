import { AuthResponse } from "@/types/auth/authResponse.type";
import { LoginPayload } from "@/types/auth/loginPayload.type";
import { RegisterPayload } from "@/types/auth/registerPayload.type";
import { RequestPasswordResetResponse } from "@/types/user/requestPasswordResetResponse.type";
import { ResetPasswordResponse } from "@/types/user/resetPasswordResponse.type";
import { VerifyResetCodeResponse } from "@/types/user/verifyResetCodeResponse.type";
import { ApiService } from "./api";
import { RefreshTokenResponse } from "@/types/auth/refreshTokenResponse.type";

export class AuthService {

  public static async registerWithEmail(
    data: RegisterPayload
  ): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>("/auth/register", data);
  }
  

  
  public static async loginWithEmail(
    data: LoginPayload
  ): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>("/auth/login", data);
  }
  


  public static async requestPasswordReset(
    email: string
  ): Promise<RequestPasswordResetResponse> {
    return ApiService.post<RequestPasswordResetResponse>("/auth/request-password-reset", { email });
  }
  


  public static async verifyResetCode(
    email : string, 
    code  : string
  ): Promise<VerifyResetCodeResponse> {
    return ApiService.post<VerifyResetCodeResponse>("/auth/verify-reset-code", { email, code });
  }
  


  public static async logoutUser(
    token : string
  ): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>("/auth/logout", {}, token);
  }



  public static async refreshAccessToken(
    refreshToken : string
  ): Promise<RefreshTokenResponse> {
    return ApiService.post<RefreshTokenResponse>("/auth/refresh", { refreshToken });
  }



  public static async resetPassword(
    token: string,
    password: string,
    repeatPassword: string,
  ): Promise<ResetPasswordResponse> {
    return ApiService.post<ResetPasswordResponse>("/auth/reset-password", {
      sessionToken: token,
      password,
      repeatPassword,
    });
  }
}



