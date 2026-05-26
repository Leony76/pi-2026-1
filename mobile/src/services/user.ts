import { AuthHandlers } from "@/types/auth/authHandlers.type";
import { ApiService } from "./api";
import { CurrentUserResponse } from "@/types/user/currentUserResponse.type";
import { UpdateCurrentUserPayload } from "@/types/user/updateCurrentUserPayload.type";

export class UserService {

  public static async fetchCurrentUser(
    auth : AuthHandlers
  ): Promise<CurrentUserResponse> {
    return ApiService.getWithAuth<CurrentUserResponse>(
      "/users/me", 
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
  


  public static async updateCurrentUser(
    data: UpdateCurrentUserPayload,
    auth: AuthHandlers
  ): Promise<CurrentUserResponse> {
    return ApiService.patchWithAuth<CurrentUserResponse>(
      "/users/me",
      data,
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
  


  public static async updateCurrentUserImage(
    profileImage : string | null,
    auth         : AuthHandlers
  ): Promise<CurrentUserResponse> {
    return ApiService.patchWithAuth<CurrentUserResponse>(
      "/users/me/image",
      { profileImage },
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  }
  


  public static async verifyCurrentPasswordToChange(
    currentPassword : string,
    professionalId  : string,
    auth: AuthHandlers
  ): Promise<boolean> {
    const response = ApiService.postWithAuth<boolean>(
      `/users/${professionalId}/verifyCurrentPasswordMatch`,
      { currentPassword },
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  
    return response;
  }
  


  public static async changeProfessionalPassword(
    newPassword    : string,
    professionalId : string,
    auth           : AuthHandlers
  ): Promise<{ message: string }> {
    const response = ApiService.postWithAuth<{ message: string }>(
      `/users/${professionalId}/changePassword`,
      { newPassword },
      auth.token,
      auth.refreshToken,
      auth.updateTokens,
      auth.signOut
    );
  
    return response;
  }
}