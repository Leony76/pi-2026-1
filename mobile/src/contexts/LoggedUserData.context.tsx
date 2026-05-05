import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./auth.context";
import { apiGetWithAuth } from "@/services/auth-api";
import { CurrentUserResponse } from "@/services/auth";
import { ApiError } from "@/services/api";

type UserProfile = CurrentUserResponse;

type UserContextData = {
  profile: UserProfile | null;
  accountType: "PROFESSIONAL" | "ENTERPRISE" | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const LoggedUserDataContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, refreshToken, updateTokens, signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accountType, setAccountType] = useState<"PROFESSIONAL" | "ENTERPRISE" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (guard: { cancelled: boolean }) => {
      if (!token || !refreshToken) {
        if (!guard.cancelled) setIsLoading(false);
        return;
      }

      if (!guard.cancelled) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await apiGetWithAuth<CurrentUserResponse>(
          "/users/me",
          token,
          refreshToken,
          updateTokens,
          signOut
        );

        if (!guard.cancelled) {
          setProfile(data);
          setAccountType(data.accountType);
        }
      } catch (err) {
        if (!guard.cancelled) {
          if (err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)) {
            await signOut();
            return;
          }

          setError(err instanceof ApiError ? err.message : "Erro ao carregar perfil");
        }
      } finally {
        if (!guard.cancelled) setIsLoading(false);
      }
    },
    [token, refreshToken, updateTokens, signOut]
  );

  useEffect(() => {
    if (!token || !refreshToken) {
      setIsLoading(false);
      return;
    }
    const guard = { cancelled: false };
    loadProfile(guard);

    return () => {
      guard.cancelled = true;
    };
  }, [token, refreshToken, loadProfile]);

  const refreshProfile = useCallback(async () => {
    const guard = { cancelled: false };
    await loadProfile(guard);
  }, [loadProfile]);

  return (
    <LoggedUserDataContext.Provider
      value={{ profile, accountType, isLoading, error, refreshProfile }}
    >
      {children}
    </LoggedUserDataContext.Provider>
  );
};

export const useLoggedUserData = () => useContext(LoggedUserDataContext);