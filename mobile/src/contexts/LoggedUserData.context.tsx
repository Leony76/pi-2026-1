import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth.context';
import { apiGetWithAuth } from '@/services/auth-api';
import { CurrentUserResponse } from '@/services/auth';
import { ApiError } from '@/services/api';

type UserProfile = {
  name: string;
  specialty: string;
  email: string;
};

type UserContextData = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const LoggedUserDataContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

      setProfile({
        name: data.name,
        specialty: data.specialty,
        email: data.email,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshToken]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <LoggedUserDataContext.Provider 
      value={{ 
        profile, 
        isLoading, 
        error, 
        refreshProfile: loadProfile 
      }}>
      {children}
    </LoggedUserDataContext.Provider>
  );
};

export const useLoggedUserData = () => useContext(LoggedUserDataContext);