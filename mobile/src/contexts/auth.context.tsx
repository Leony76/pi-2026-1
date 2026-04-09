import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
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

function getWebToken(): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function setWebToken(value: string): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, value);
}

function clearWebToken(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

function getWebRefreshToken(): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setWebRefreshToken(value: string): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_KEY, value);
}

function clearWebRefreshToken(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  if (typeof SecureStore.isAvailableAsync !== "function") {
    return false;
  }

  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
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

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      refreshToken,
      isLoadingSession,
      async signIn(nextToken: string, nextRefreshToken: string) {
        const useSecureStore = await isSecureStoreAvailable();

        if (useSecureStore) {
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, nextToken);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, nextRefreshToken);
        } else {
          setWebToken(nextToken);
          setWebRefreshToken(nextRefreshToken);
        }

        setToken(nextToken);
        setRefreshToken(nextRefreshToken);
      },
      async updateTokens(nextToken: string, nextRefreshToken: string) {
        const useSecureStore = await isSecureStoreAvailable();

        if (useSecureStore) {
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, nextToken);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, nextRefreshToken);
        } else {
          setWebToken(nextToken);
          setWebRefreshToken(nextRefreshToken);
        }

        setToken(nextToken);
        setRefreshToken(nextRefreshToken);
      },
      async signOut() {
        const useSecureStore = await isSecureStoreAvailable();

        if (useSecureStore) {
          await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        } else {
          clearWebToken();
          clearWebRefreshToken();
        }

        setToken(null);
        setRefreshToken(null);
      },
    };
  }, [token, refreshToken, isLoadingSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
