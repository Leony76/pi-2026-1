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
import ContentNotFound from '@/components/ui/ContentNotFound'

const Rooms = (): React.JSX.Element => {

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomDisplayCard[]>([]);
  const [urlParamsMessage, setUrlParamsMessage] = useState<string | null>(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const params = useLocalSearchParams<{ message?: string }>();
  
  useEffect(() => {
    (async() => {
      try {
        setIsLoadingRooms(true);
        setRoomsError(null);

        const roomsData = await fetchRooms();

        setRooms(roomsData);
      } catch {
        setRoomsError('Não foi possível carregar as salas.');   
      } finally {
        setIsLoadingRooms(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof params.message === 'string' && params.message.trim()) {
      setUrlParamsMessage(params.message);
      setToastVisible(true);
    }
  }, [params.message]);

  const handleCloseToast = () => {
    setToastVisible(false);
    setUrlParamsMessage(null);

    router.setParams({});
  };

  return (
    <LayoutWrapper>
      { (toastVisible && urlParamsMessage) &&
        <Toast
          message={urlParamsMessage}
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
                <View className='fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]'>
                  <ContentNotFound text='Nenhuma sala cadastrada no momento!'/>
                </View>
              )
            }
            renderItem={({ item }) => (
              <Card.DisplayRoom
                fromManagerView
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
