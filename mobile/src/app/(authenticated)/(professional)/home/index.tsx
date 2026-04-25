import React, { useEffect, useState } from 'react'
import { FlatList, View, ActivityIndicator, Text } from 'react-native'
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import SystemLayout from '@/components/layout/SystemLayout';
import { RoomDisplayCard } from '@/types/room.type';
import { Card } from '@/components/card';
import { Allocation } from '@/types/allocation.type';
import { getFirstName } from '@/utils/getFirstName';
import { useLoggedUserData } from '@/contexts/LoggedUserData.context';
import { fetchRooms } from '@/services/rooms';

const Home = (): React.JSX.Element => {

  const { profile } = useLoggedUserData(); 
  const [allocationType, setAllocationType] = useState<Allocation | null>(null);
  const [rooms, setRooms] = useState<RoomDisplayCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRooms();
        setRooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar salas');
        console.error('Erro ao carregar salas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
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
        />
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Home;