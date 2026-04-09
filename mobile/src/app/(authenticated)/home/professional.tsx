import { useAuth } from '@/contexts/auth.context';
import { ApiError } from '@/services/api';
import { CurrentUserResponse } from '@/services/auth';
import { apiGetWithAuth } from '@/services/auth-api';
import { FULL_OPTIONS_MAP } from '@/constants/maps/selectOptions.map';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, Text, View } from 'react-native'
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import SystemLayout from '@/components/layout/SystemLayout';
import { Button } from '@/components/button';
import { RoomDisplayCard } from '@/types/room.type';
import { Card } from '@/components/card';
import Section from '@/components/ui/Section';

type ProfileState = {
  name: string;
  specialty: string;
  email: string;
};

type Allocation = 
| 'PER_HOUR'
| '3X_WEEK'
| 'MONTH'
;

// Considere isso sendo as informações vindas da API
const DISPLAY_ROOMS_DATA: RoomDisplayCard[] = [
  { 
    id: 1,
    displayImage: 'https://kannoarquitetura.com.br/wp-content/uploads/2021/06/Consultorio-medico-moderno.jpg',
    isAvailable: true,
    title: 'Sala 01 - Consultório',
    subtitle: 'Térreo - 18m² - Climatizado',
    prices: {
      perHour : 79.9,
      _3xWeek : 599.9,
      month   : 899.9,
    }
  },
  { 
    id: 2,
    displayImage: 'https://s2-casaejardim.glbimg.com/YDSDM-LluilU9ssjfRE2TZKyU30=/0x0:1400x933/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_a0b7e59562ef42049f4e191fe476fe7d/internal_photos/bs/2023/R/0/0LKjMLQMmeMBUzxzgUuA/1-consultorio-simara-mello.jpg',
    isAvailable: true,
    title: 'Sala 02 - Psicologia',
    subtitle: 'Térreo - 16m² - Isonorizado',
    prices: {
      perHour : 64.9,
      month   : 479.9,
      _3xWeek : 779.9,
    }
  },
  { 
    id: 3,
    displayImage: 'https://cdn.cineart.com.br/cineart_411857079.jpg',
    isAvailable: false,
    title: 'Sala 03 - Premium',
    subtitle: '1º Andar - 69m² - Completo',
    prices: {
      perHour : 264.9,
      month   : 879.9,
      _3xWeek : 1779.9,
    }
  },
]; 

const ProfessionalHome = (): React.JSX.Element => {
  const { signOut, token, refreshToken, updateTokens } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profile, setProfile] = useState<ProfileState | null>(null);

  const [allocationType, setAllocationType] = useState<Allocation | null>(null);

  const [profileError, setProfileError] = useState<string | null>(null);

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
    <LayoutWrapper>
      <SystemLayout 
      title={`Olá Dr. ${profile?.name ?? 'Desconhecido'}!`} 
      description={'Escolha seu espaço e horário'} 
      layoutType={'PROFSSIONAL'}      
      tab='HOME'
      >
        <Section title='TIPOS DE ALOCAÇÃO'>
          <Button.Default
            label='Por hora'
            filled={allocationType === 'PER_HOUR'}
            onTouch={() => setAllocationType(allocationType === 'PER_HOUR' ? null : 'PER_HOUR')}
            customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
          />

          <Button.Default
            label='3x Semana'
            filled={allocationType === '3X_WEEK'}
            onTouch={() => setAllocationType(allocationType === '3X_WEEK' ? null : '3X_WEEK')}
            customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
          />

          <Button.Default
            label='Mês'
            filled={allocationType === 'MONTH'}
            onTouch={() => setAllocationType(allocationType === 'MONTH' ? null : 'MONTH')}
            customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
          />
        </Section>
        
        <FlatList
          data={DISPLAY_ROOMS_DATA}
          keyExtractor={(key) => String(key)}
          ItemSeparatorComponent={() => <View className='h-5'/>}
          className='h-1'
          renderItem={({ item }) => (
            <Card.DisplayRoom
              key={item.id}
              { ...item }
            />
          )}
        />
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default ProfessionalHome;