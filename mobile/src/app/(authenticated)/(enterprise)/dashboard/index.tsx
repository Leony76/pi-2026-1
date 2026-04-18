import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { RoomOccupation } from '@/types/roomOccupation.type'
import { useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

const ROOM_OCCUPATION_DATA: RoomOccupation[] = [
  {
    id: 1,
    isAvailable: false,
    occupant: 'Victor Gideon',
    title: 'Sala 01',
    occupation: {
      startTime : '2026-04-13T14:00:00.000Z',
      endTime   : '2026-04-13T15:00:00.000Z',
    },
  },
  {
    id: 2,
    isAvailable: true,
    occupant: null,
    title: 'Sala 01',
    occupation: {
      startTime : null,
      endTime   : null,
    },
  },
  {
    id: 3,
    isAvailable: false,
    occupant: 'Albert Wesker',
    title: 'Sala 02',
    occupation: {
      startTime : '2026-04-13T16:00:00.000Z',
      endTime   : '2026-04-13T17:00:00.000Z',
    },
  },
];

const Home = (): React.JSX.Element => {

  const router = useRouter();

  return (
    <LayoutWrapper>
      <SystemLayout 
      title='Painel da empresa' 
      description={'Visão geral - hoje'} 
      layoutType={'ENTERPRISE'}      
      tab='DASHBOARD'
      > 
        <ScrollView contentContainerClassName='py-6 gap-5'>
          <View className='flex-row justify-between gap-3'>
            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-medroom-primary text-4xl'>
                {'3'}
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Salas totais
              </Text>
            </View>

            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-green-600 text-4xl'>
                {'2'}
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Disponíveis
              </Text>
            </View>

            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-red-700 text-4xl'>
                {'1'}
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Oculpadas
              </Text>
            </View>
          </View>

          <View className='gap-5'>
            <Text className='text-medroom-secondary text-lg font-nunito-bold'>
              MOVIMENTAÇÃO HOJE
            </Text>

            <View className='flex-row gap-3'>
              <View className={`border-2 flex-1 p-3 px-5 rounded-xl border-medroom-primaryLight`}>
                <Text className='text-medroom-secondary font-nunito-bold text-base'>
                  Entradas
                </Text>
          
                <Text className={`text-3xl font-nunito-bold text-green-600`}>
                  4
                </Text>
          
                <Text className='text-medroom-secondary text-sm font-nunito-bold'>
                  Profissionais hoje
                </Text>
              </View>

              <View className={`border-2 flex-1 p-3 px-5 rounded-xl border-medroom-primaryLight`}>
                <Text className='text-medroom-secondary font-nunito-bold text-base'>
                  Saídas
                </Text>
          
                <Text className={`text-3xl font-nunito-bold text-red-600`}>
                  2
                </Text>
          
                <Text className='text-medroom-secondary text-sm font-nunito-bold'>
                  Já encerradas
                </Text>
              </View>
            </View>
          </View>

          <View className='gap-3'>
            <View className='flex-row items-center justify-between'>
              <Text className='text-medroom-secondary text-lg font-nunito-bold'>
                OCUPAÇÃO POR SALA
              </Text>

              <Button.Default
                label='Ver mais'
                onTouch={() => router.push('/(authenticated)/(enterprise)/dashboard/occupationRooms')}
                customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
              />
            </View>

            { ROOM_OCCUPATION_DATA.length > 0 ? (
              ROOM_OCCUPATION_DATA.map(( item ) => (
                <Card.RoomOccupation
                  key={item.id}
                { ...item }
                />
              ))
            ) : (
              <ContentNotFound text='Nenhum sala encontrada!'/>
            )}
          </View>      
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Home