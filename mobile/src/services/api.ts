import { Platform } from "react-native";
import { AuthService } from "./auth";
import { ApiErrorPayload } from "@/types/auth/apiErrorPayload.type";
import { RefreshTokenHandler } from "@/types/auth/refreshTokenHandler.type";
import { SignOutHandler } from "@/types/auth/signOutHandler.type";

export class ApiError extends Error {
  constructor(
    message: string, 
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiService {

  private static readonly defaultBaseUrl: string = Platform.select({
    android : "http://192.168.0.5:3333",
    ios     : "http://localhost:3333",
    default : "http://localhost:3333",
  }) ?? "http://localhost:3333";

  private static readonly API_BASE_URL = 
    process.env.EXPO_PUBLIC_API_URL 
    || 
    this.defaultBaseUrl
  ;

  // ----< SEM AUTENTICAÇÃO REQUERIDA >

  public static async post<TResponse>(
    path   : string, 
    body   : unknown, 
    token? : string
  ): Promise<TResponse> {
    const response = await fetch(`${this.API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const rawPayload = await response.text();
    const parsedPayload = rawPayload ? (JSON.parse(rawPayload) as ApiErrorPayload | TResponse) : null;

    if (!response.ok) {
      const message =
        parsedPayload && typeof parsedPayload === "object" && "message" in parsedPayload
          ? (parsedPayload.message ?? "Erro na requisição")
          : "Erro na requisição";

      throw new ApiError(message, response.status);
    }

    return parsedPayload as TResponse;
  }



  public static async patch<TResponse>(
    path   : string, 
    body   : unknown, 
    token? : string
  ): Promise<TResponse> {
    const response = await fetch(`${this.API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const rawPayload = await response.text();
    const parsedPayload = rawPayload ? (JSON.parse(rawPayload) as ApiErrorPayload | TResponse) : null;

    if (!response.ok) {
      const message =
        parsedPayload && typeof parsedPayload === "object" && "message" in parsedPayload
          ? (parsedPayload.message ?? "Erro na requisição")
          : "Erro na requisição";

      throw new ApiError(message, response.status);
    }

    return parsedPayload as TResponse;
  }

  

  public static async get<TResponse>(
    path   : string, 
    token? : string
  ): Promise<TResponse> {
    const response = await fetch(`${this.API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const rawPayload = await response.text();
    const parsedPayload = rawPayload ? (JSON.parse(rawPayload) as ApiErrorPayload | TResponse) : null;

    if (!response.ok) {
      const message =
        parsedPayload && typeof parsedPayload === "object" && "message" in parsedPayload
          ? (parsedPayload.message ?? "Erro na requisição")
          : "Erro na requisição";

      throw new ApiError(message, response.status);
    }

    return parsedPayload as TResponse;
  }

  // ----< COM AUTENTICAÇÃO REQUERIDA >

  public static async postWithAuth<TResponse>(
    path              : string,
    body              : unknown,
    token             : string,
    refreshToken      : string,
    onTokensRefreshed : RefreshTokenHandler,
    onSignOut         : SignOutHandler
  ): Promise<TResponse> {
    try {
      return await this.post<TResponse>(path, body, token);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        try {
          const refreshResponse = await AuthService.refreshAccessToken(refreshToken);
          
          await onTokensRefreshed(refreshResponse.token, refreshResponse.refreshToken);
          
          return await this.post<TResponse>(path, body, refreshResponse.token);
        } catch (refreshError) {
          await onSignOut();
          throw refreshError;
        }
      }

      throw error;
    }
  } 


  public static async patchWithAuth<TResponse>(
    path              : string,
    body              : unknown,
    token             : string,
    refreshToken      : string,
    onTokensRefreshed : RefreshTokenHandler,
    onSignOut         : SignOutHandler
  ): Promise<TResponse> {
    try {
      return await this.patch<TResponse>(path, body, token);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        try {
          const refreshResponse = await AuthService.refreshAccessToken(refreshToken);

          await onTokensRefreshed(refreshResponse.token, refreshResponse.refreshToken);

          return await this.patch<TResponse>(path, body, refreshResponse.token);
        } catch (refreshError) {
          await onSignOut();
          throw refreshError;
        }
      }

      throw error;
    }
  }


  public static async getWithAuth<TResponse>(
    path              : string,
    token             : string,
    refreshToken      : string,
    onTokensRefreshed : RefreshTokenHandler,
    onSignOut         : SignOutHandler
  ): Promise<TResponse> {
    try {
      return await this.get<TResponse>(path, token);
    } catch (error) {

      if (error instanceof ApiError && error.statusCode === 401) {
        try {
          const refreshResponse = await AuthService.refreshAccessToken(refreshToken);

          await onTokensRefreshed(refreshResponse.token, refreshResponse.refreshToken);
          
          return await this.get<TResponse>(path, refreshResponse.token);
        } catch (refreshError) {
          await onSignOut();
          throw refreshError;
        }
      }

      throw error;
    }
  }
}


