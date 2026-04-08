import { Button } from '@/components/button';
import { useAuth } from '@/contexts/auth.context';
import { ApiError } from '@/services/api';
import { CurrentUserResponse } from '@/services/auth';
import { apiGetWithAuth } from '@/services/auth-api';
import { FULL_OPTIONS_MAP } from '@/constants/maps/selectOptions.map';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, View } from 'react-native'

type ProfileState = {
  name: string;
  specialty: string;
  email: string;
} | null;

const Dashboard = () => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<ProfileState>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const { signOut, token, refreshToken, updateTokens } = useAuth();

  function getSpecialtyLabel(value?: string) {
    const specialty = FULL_OPTIONS_MAP.SPECIALTY.find((item) => item.value === value);

    return specialty?.label ?? value ?? '';
  }

  useEffect(() => {
    async function loadProfile() {
      if (!token || !refreshToken) {
        return;
      }

      try {
        setIsLoadingProfile(true);
        setProfileError(null);
        
        const currentUser = await apiGetWithAuth<CurrentUserResponse>(
          '/users/me',
          token,
          refreshToken,
          updateTokens,
          signOut
        );
        
        setProfile({
          name: currentUser.name,
          specialty: currentUser.specialty,
          email: currentUser.email,
        });
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar seu perfil.';

        setProfileError(message);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [token, refreshToken, updateTokens, signOut]);

  async function handleLogout() {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
      router.replace('/login');
    } catch {
      Alert.alert('Erro', 'Não foi possível sair da sua conta.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <View className='flex-1 items-center justify-center px-8 gap-8 bg-white'>
      <View className='items-center gap-3'>
        <Text className='text-3xl font-nunito-bold text-medroom-primary'>
          Dashboard
        </Text>

        {isLoadingProfile ? (
          <ActivityIndicator size="small" color="#1ab0b4" />
        ) : profileError ? (
          <Text className='text-sm text-red-600 text-center font-nunito'>
            {profileError}
          </Text>
        ) : (
          <View className='items-center gap-1'>
            <Text className='text-lg font-nunito-bold text-slate-800'>
              {profile?.name}
            </Text>
            <Text className='text-sm font-nunito text-slate-500'>
              {getSpecialtyLabel(profile?.specialty)}
            </Text>
            <Text className='text-sm font-nunito text-slate-500'>
              {profile?.email}
            </Text>
          </View>
        )}
      </View>

      <Button.Default
        onTouch={handleLogout}
        label={isSigningOut ? 'Saindo...' : 'Sair'}
        customStyle={{ container: 'w-full max-w-xs' }}
      />
    </View>
  )
}

export default Dashboard;