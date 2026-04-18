import React, { useState } from 'react'
import { FlatList, View } from 'react-native'
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import SystemLayout from '@/components/layout/SystemLayout';
import { RoomDisplayCard } from '@/types/room.type';
import { Card } from '@/components/card';
import { Allocation } from '@/types/allocation.type';
import { getFirstName } from '@/utils/getFirstName';
import { useLoggedUserData } from '@/contexts/LoggedUserData.context';

// Considere isso sendo as informações vindas da API
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

const Home = (): React.JSX.Element => {

  const { profile } = useLoggedUserData(); 
  const [allocationType, setAllocationType] = useState<Allocation | null>(null);

  return (
    <LayoutWrapper>
      <SystemLayout 
      title={`Olá Dr. ${profile ? getFirstName(profile.name) : 'Desconhecido'} !`} 
      description={'Escolha seu espaço e horário'} 
      layoutType={'PROFESSIONAL'}      
      tab='HOME'
      > 
        <FlatList
          data={DISPLAY_ROOMS_DATA}
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