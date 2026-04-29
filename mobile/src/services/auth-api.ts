import { ApiError, apiGet, apiPatch, apiPost } from "./api";
import { refreshAccessToken } from "./auth";

type RefreshTokenHandler = (newToken: string, newRefreshToken: string) => Promise<void>;
type SignOutHandler = () => Promise<void>;

/**
 * Helper to make an authenticated POST request with automatic token refresh on 401
 * If the access token is expired, this will automatically refresh it and retry
 */
export async function apiPostWithAuth<TResponse>(
  path: string,
  body: unknown,
  token: string,
  refreshToken: string,
  onTokensRefreshed: RefreshTokenHandler,
  onSignOut: SignOutHandler
): Promise<TResponse> {
  try {
    return await apiPost<TResponse>(path, body, token);
  } catch (error) {
    // If 401 Unauthorized, try to refresh the token
    if (error instanceof ApiError && error.statusCode === 401) {
      try {
        const refreshResponse = await refreshAccessToken(refreshToken);
        
        // Notify the auth context about the new tokens
        await onTokensRefreshed(refreshResponse.token, refreshResponse.refreshToken);
        
        // Retry the original request with the new token
        return await apiPost<TResponse>(path, body, refreshResponse.token);
      } catch (refreshError) {
        // If refresh fails, sign out the user
        await onSignOut();
        throw refreshError;
      }
    }

    // Re-throw if not a 401 error
    throw error;
  }
}

/**
 * Helper to make an authenticated PATCH request with automatic token refresh on 401
 */
export async function apiPatchWithAuth<TResponse>(
  path: string,
  body: unknown,
  token: string,
  refreshToken: string,
  onTokensRefreshed: RefreshTokenHandler,
  onSignOut: SignOutHandler
): Promise<TResponse> {
  try {
    return await apiPatch<TResponse>(path, body, token);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      try {
        const refreshResponse = await refreshAccessToken(refreshToken);

        await onTokensRefreshed(refreshResponse.token, refreshResponse.refreshToken);

        return await apiPatch<TResponse>(path, body, refreshResponse.token);
      } catch (refreshError) {
        await onSignOut();
        throw refreshError;
      }
    }

    throw error;
  }
}

/**
 * Helper to make an authenticated GET request with automatic token refresh on 401
 */
export async function apiGetWithAuth<TResponse>(
  path: string,
  token: string,
  refreshToken: string,
  onTokensRefreshed: RefreshTokenHandler,
  onSignOut: SignOutHandler
): Promise<TResponse> {
  try {
    return await apiGet<TResponse>(path, token);
  } catch (error) {
    // If 401 Unauthorized, try to refresh the token
    if (error instanceof ApiError && error.statusCode === 401) {
      try {
        const refreshResponse = await refreshAccessToken(refreshToken);
        
        // Notify the auth context about the new tokens
        await onTokensRefreshed(refreshResponse.token, refreshResponse.refreshToken);
        
        // Retry the original request with the new token
        return await apiGet<TResponse>(path, refreshResponse.token);
      } catch (refreshError) {
        // If refresh fails, sign out the user
        await onSignOut();
        throw refreshError;
      }
    }

    // Re-throw if not a 401 error
    throw error;
  }
}
