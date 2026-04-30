import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import Toast from '@/components/ui/Toast'
import { RoomDisplayCard } from '@/types/room.type'
import { fetchRooms } from '@/services/rooms'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'

const Rooms = (): React.JSX.Element => {

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomDisplayCard[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const params = useLocalSearchParams();
  
  useEffect(() => {
    let isMounted = true;

    async function loadRooms() {
      try {
        setIsLoadingRooms(true);
        setRoomsError(null);

        const roomsData = await fetchRooms();

        if (isMounted) {
          setRooms(roomsData);
        }
      } catch {
        if (isMounted) {
          setRoomsError('Não foi possível carregar as salas.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingRooms(false);
        }
      }
    }

    loadRooms();

    if (params.message) {
      setToastVisible(true);
    }

    return () => {
      isMounted = false;
    };
  }, [params.message]);

  const handleCloseToast = () => {
    setToastVisible(false);
    router.setParams({ message: '' });
  };

  return (
    <LayoutWrapper>
      { toastVisible &&
        <Toast
          message={params.message as string}
          onClose={handleCloseToast}
          visible={toastVisible}
        />
      }

      <SystemLayout 
      title='Gerenciar salas' 
      description={'Adicione e edite'} 
      layoutType={'ENTERPRISE'}      
      tab='ROOMS'
      > 
        <View className='gap-5 flex-1 pb-6'>
          <FlatList
            data={rooms}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            ItemSeparatorComponent={() => <View className='h-5'/>}
            contentContainerClassName='py-6'
            className='border-b border-b-medroom-primaryLight'
            ListEmptyComponent={
              isLoadingRooms ? (
                <View className='py-8 items-center justify-center'>
                  <Text className='text-medroom-secondary font-nunito'>
                    Carregando salas...
                  </Text>
                </View>
              ) : roomsError ? (
                <View className='py-8'>
                  <Text className='text-red-600 font-nunito-bold text-center'>
                    {roomsError}
                  </Text>
                </View>
              ) : (
                <View className='py-8' />
              )
            }
            renderItem={({ item }) => (
              <Card.DisplayRoom
                pressable={false}
                key={item.id}
                { ...item }
              />
            )}
          />

          <Button.Default
            label='Adicionar sala'
            icon={{ name: 'new', size: { width: 28, height: 28 } }}
            onTouch={() => router.push('/(authenticated)/(enterprise)/rooms/newRoomWizard')}
            borderStyle='DASHED'
            customStyle={{ container: 'border-2' }}
          />
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Rooms
