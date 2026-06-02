import React, { useEffect, useState } from 'react'
import { FlatList, View, ActivityIndicator, Text } from 'react-native'
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import SystemLayout from '@/components/layout/SystemLayout';
import { RoomDisplayCard } from '@/types/room/room.type';
import { Card } from '@/components/card';
import { getFirstName } from '@/utils/getFirstName';
import { useLoggedUserData } from '@/contexts/LoggedUserData.context';
import { RoomService } from '@/services/rooms';
import ContentNotFound from '@/components/ui/ContentNotFound';
import { useAuth } from '@/contexts/auth.context';
import { AuthHandlers } from '@/types/auth/authHandlers.type';

const Home = (): React.JSX.Element => {

  const { token, refreshToken, updateTokens, signOut } = useAuth();

  const { profile } = useLoggedUserData(); 
  const [rooms, setRooms] = useState<RoomDisplayCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!refreshToken || !token) return;

        setLoading(true);
        setError(null);

        const authHandlers: AuthHandlers = { 
          refreshToken : refreshToken,
          token        : token,
          signOut      : signOut,
          updateTokens : updateTokens,
        };

        const data = await RoomService.fetchRooms(authHandlers);
        setRooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar salas');
        console.error('Erro ao carregar salas:', err);
      } 
    })();
  }, []);

  if (loading) {
    return (
      <LayoutWrapper>
        <SystemLayout 
        title={`Olá Dr. ${profile ? getFirstName(profile.name) : 'Desconhecido'} !`} 
        description={'Carregando salas...'} 
        layoutType={'PROFESSIONAL'}      
        tab='HOME'
        > 
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <SystemLayout 
        title={`Olá Dr. ${profile ? getFirstName(profile.name) : 'Desconhecido'} !`} 
        description={'Erro ao carregar salas'} 
        layoutType={'PROFESSIONAL'}      
        tab='HOME'
        > 
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 text-center">{error}</Text>
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <SystemLayout 
      title={`Olá Dr. ${profile ? getFirstName(profile.name) : 'Desconhecido'} !`} 
      description={'Escolha seu espaço e horário'} 
      layoutType={'PROFESSIONAL'}      
      tab='HOME'
      > 
        <FlatList
          data={rooms}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ItemSeparatorComponent={() => <View className='h-5'/>}
          contentContainerClassName='py-6'
          renderItem={({ item }) => (
            <Card.DisplayRoom
            key={item.id}         
            { ...item }
            />
          )}
          ListEmptyComponent={() => (
            <View className='fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]'>
              <ContentNotFound text='Nenhuma sala cadastrada no sistema no momento!'/>
            </View>
          )}
        />
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Home;