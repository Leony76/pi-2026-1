import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import Toast from '@/components/ui/Toast'
import { RoomDisplayCard } from '@/types/room/room.type'
import { RoomService } from '@/services/rooms'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { useAuth } from '@/contexts/auth.context'
import { AuthHandlers } from '@/types/auth/authHandlers.type'
import { Modal } from '@/components/modal'

const Rooms = (): React.JSX.Element => {

  const { token, refreshToken, updateTokens, signOut } = useAuth();

  const [modal, setModal] = useState<'REMOVE_ROOM' | null>(null);
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'ERROR' | 'SUCCESS'} | null>(null);
  const [roomIdToRemove, setRoomIdToRemove] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomDisplayCard[]>([]);
  const [urlParamsMessage, setUrlParamsMessage] = useState<string | null>(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const params = useLocalSearchParams<{ message?: string }>();
  
  const handleRemoveRoom = async(id: string): Promise<void> => {
    if (!refreshToken || !token) return;
    
    try {
      const authHandlers: AuthHandlers = {
        refreshToken,
        token,
        signOut,      
        updateTokens,
      };

      const response = await RoomService.remove(authHandlers ,id);

      if (response.success) {
        setToastMessage({message: response.message, type: 'SUCCESS' });
        setRooms(prev => prev.filter(room => room.id !== id));
      }
    } catch (error:unknown) { 
      if (error instanceof Error) setToastMessage({message: error.message, type: 'ERROR'});;
    } finally {
      setRoomIdToRemove(null);
      setModal(null);
    }
  };

  useEffect(() => {
    (async() => {
      try {
        if (!refreshToken || !token) return;
        setIsLoadingRooms(true);
        setRoomsError(null);

        const authHandlers: AuthHandlers = { 
          refreshToken : refreshToken,
          token        : token,
          signOut      : signOut,
          updateTokens : updateTokens,
        };

        const roomsData = await RoomService.fetchRooms(authHandlers);

        setRooms(roomsData);
      } catch {
        setRoomsError('Não foi possível carregar as salas.');   
      } finally {
        setIsLoadingRooms(false);
      }
    })();
  }, [token, refreshToken, updateTokens, signOut]);

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

      <Modal.ConfirmAction
        confirmMessage='Tem certeza em remover está sala ?'
        onConfirm={() => { 
          if (!roomIdToRemove) return;
          handleRemoveRoom(String(roomIdToRemove));
        }}
        onRequestClose={() => setModal(null)}
        visible={modal === 'REMOVE_ROOM'}
      />

      { toastMessage &&
        <Toast
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
          visible={!!toastMessage}
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
                remove={(roomId) => {
                  setModal('REMOVE_ROOM');
                  setRoomIdToRemove(roomId);
                }}
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
