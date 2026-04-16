import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { RoomDisplayCard } from '@/types/room.type'
import { router } from 'expo-router'
import React from 'react'
import { FlatList, View } from 'react-native'

const DISPLAY_ROOMS_DATA: RoomDisplayCard[] = [
  { 
    id: 1,
    displayImage: 'https://kannoarquitetura.com.br/wp-content/uploads/2021/06/Consultorio-medico-moderno.jpg',
    isAvailable: true,
    title: 'Sala 01 - Consultório',
    complementaryData: {
      area       : 18,
      additional : 'Climatizado',
      floor      : 'Térreo',
    },
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
    complementaryData: {
      area       : 16,
      additional : 'Isonorizado',
      floor      : 'Térreo',
    },
    prices: {
      perHour : 64.9,
      _3xWeek : 479.9,
      month   : 779.9,
    }
  },
  { 
    id: 3,
    displayImage: 'https://cdn.cineart.com.br/cineart_411857079.jpg',
    isAvailable: false,
    title: 'Sala 03 - Premium',
    complementaryData: {
      area       : 69,
      additional : 'Completo',
      floor      : '1º Andar',
    },
    prices: {
      perHour : 264.9,
      month   : 879.9,
      _3xWeek : 1779.9,
    }
  },
]; 

const Rooms = (): React.JSX.Element => {
  return (
    <LayoutWrapper>
      <SystemLayout 
      title='Gerenciar salas' 
      description={'Adicione e edite'} 
      layoutType={'ENTERPRISE'}      
      tab='ROOMS'
      > 
        <View className='gap-5 flex-1 pb-6'>
          <FlatList
            data={DISPLAY_ROOMS_DATA}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            ItemSeparatorComponent={() => <View className='h-5'/>}
            contentContainerClassName='py-6'
            className='border-b border-b-medroom-primaryLight'
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