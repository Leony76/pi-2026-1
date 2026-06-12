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

  const title = `Olá Dr. ${profile ? getFirstName(profile.name) : 'Desconhecido'}!`;

  const description = loading
    ? 'Carregando salas...'
    : error
      ? 'Erro ao carregar salas'
      : 'Escolha seu espaço e horário';

  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      try {
        if (!refreshToken || !token) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const authHandlers: AuthHandlers = { 
          refreshToken : refreshToken,
          token        : token,
          signOut      : signOut,
          updateTokens : updateTokens,
        };

        const data = await RoomService.fetchRooms(authHandlers);
        if (!cancelled) setRooms(data);
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : 'Erro ao carregar salas');
        console.error('Erro ao carregar salas:', err);
      } finally {
        if (!cancelled) setLoading(false);
      } 
    };

    void loadRooms();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, token, signOut, updateTokens]);

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => <View className='h-5'/>
        }
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }}
        renderItem={({ item }) => (
          <Card.DisplayRoom
            {...item}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center">
            <ContentNotFound text='Nenhuma sala cadastrada no sistema no momento!'/>
          </View>
        )}
      />
    );
  };

  return (
    <LayoutWrapper>
      <SystemLayout 
      title={title} 
      description={description} 
      layoutType={'PROFESSIONAL'}      
      tab='HOME'
      >
        {renderContent()}
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Home;