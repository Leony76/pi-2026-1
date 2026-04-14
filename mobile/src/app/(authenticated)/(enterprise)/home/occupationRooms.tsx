import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { RoomOccupation } from '@/types/roomOccupation.type'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'

// Supondo que virá essas informações da API (Completa)
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

const OccupationRooms = (): React.JSX.Element => {

  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    const search = searchValue?.toLowerCase() ?? '';

    return ROOM_OCCUPATION_DATA.filter((room) => {
      const titleMatch = room.title.toLowerCase().includes(search);
      const occupantMatch = room.occupant?.toLowerCase().includes(search);

      return titleMatch || occupantMatch;
    });
  }, [searchValue, ROOM_OCCUPATION_DATA]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Ocupação por sala'
      description='Listagem das ocupações por sala'
      tab='DASHBOARD'
      goBack={() => router.back()}
      layoutType='ENTERPRISE'    
      >
        <View className='flex-1 py-6 gap-5'>
          <Input.Search
            onChangeText={(text) => setSearchValue(text)}
            clear={() => setSearchValue(null)}
            value={searchValue ?? ''}
          />
          
          <View className={`flex-1 gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>
            <FlatList
              data={filteredList}
              contentContainerClassName='gap-4 py-1'
              keyExtractor={(item, index) => `${item.id}-${index}`}
              ListEmptyComponent={ <ContentNotFound text={`Nenhum resultado para "${ searchValue }"`}/> }
              renderItem={({ item }) => (
                <Card.RoomOccupation
                  key={item.id}
                  { ...item }
                />
              )}
            />
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default OccupationRooms;