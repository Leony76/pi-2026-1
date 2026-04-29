import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth.context';
import { apiGetWithAuth } from '@/services/auth-api';
import { CurrentUserResponse } from '@/services/auth';
import { ApiError } from '@/services/api';

type UserProfile = CurrentUserResponse;

type UserContextData = {
  profile: UserProfile | null;
  accountType: 'PROFESSIONAL' | 'ENTERPRISE' | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const LoggedUserDataContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accountType, setAccountType] = useState<'PROFESSIONAL' | 'ENTERPRISE' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!token || !refreshToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await apiGetWithAuth<CurrentUserResponse>(
        '/users/me',
        token,
        refreshToken,
        updateTokens,
        signOut
      );

      setProfile(data);
      setAccountType(data.accountType);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshToken, updateTokens, signOut]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <LoggedUserDataContext.Provider 
      value={{ 
        profile, 
        accountType,
        isLoading, 
        error, 
        refreshProfile: loadProfile 
      }}>
      {children}
    </LoggedUserDataContext.Provider>
  );
};

export const useLoggedUserData = () => useContext(LoggedUserDataContext);