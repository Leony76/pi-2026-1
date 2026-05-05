import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type AuthContextValue = {
  token: string | null;
  refreshToken: string | null;
  isLoadingSession: boolean;
  signIn: (token: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateTokens: (token: string, refreshToken: string) => Promise<void>;
};

const AUTH_TOKEN_KEY = "checkinmed.auth.token";
const REFRESH_TOKEN_KEY = "checkinmed.auth.refreshToken";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (typeof SecureStore.isAvailableAsync !== "function") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function getWebToken(): string | null {
  return typeof window !== "undefined" && window.localStorage
    ? window.localStorage.getItem(AUTH_TOKEN_KEY)
    : null;
}

function getWebRefreshToken(): string | null {
  return typeof window !== "undefined" && window.localStorage
    ? window.localStorage.getItem(REFRESH_TOKEN_KEY)
    : null;
}

async function persistTokens(token: string, refreshToken: string): Promise<void> {
  const useSecureStore = await isSecureStoreAvailable();
  if (useSecureStore) {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

async function clearTokens(): Promise<void> {
  const useSecureStore = await isSecureStoreAvailable();
  if (useSecureStore) {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    async function loadTokens() {
      try {
        const useSecureStore = await isSecureStoreAvailable();
        const storedToken = useSecureStore
          ? await SecureStore.getItemAsync(AUTH_TOKEN_KEY)
          : getWebToken();
        const storedRefreshToken = useSecureStore
          ? await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
          : getWebRefreshToken();

        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
      } finally {
        setIsLoadingSession(false);
      }
    }

    loadTokens();
  }, []);

  const signIn = useCallback(async (nextToken: string, nextRefreshToken: string) => {
    await persistTokens(nextToken, nextRefreshToken);
    setToken(nextToken);
    setRefreshToken(nextRefreshToken);
  }, []);

  const updateTokens = useCallback(async (nextToken: string, nextRefreshToken: string) => {
    await persistTokens(nextToken, nextRefreshToken);
    setToken(nextToken);
    setRefreshToken(nextRefreshToken);
  }, []);

  const signOut = useCallback(async () => {
    await clearTokens();
    setToken(null);
    setRefreshToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ token, refreshToken, isLoadingSession, signIn, updateTokens, signOut }),
    [token, refreshToken, isLoadingSession, signIn, updateTokens, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}