import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { Modal } from '@/components/modal'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import Toast from '@/components/ui/Toast'
import { OverallRoomRevenue, RoomRevenue } from '@/types/roomRevenue.type'
import { priceFormat } from '@/utils/priceFormat'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'

// Supondo que virá essas informações da API (Completa)
const ROOMS_REVENUE_DATA: OverallRoomRevenue = {
  totalRevenue: 534322,
  roomsRevenue: [
    {
      id: 1,
      room: 'Sala 01',
      totalRevenue: 17500,
    },
    {
      id: 2,
      room: 'Sala 02',
      totalRevenue: 23500,
    },
    {
      id: 3,
      room: 'Sala 03',
      totalRevenue: 32500,
    },
    {
      id: 4,
      room: 'Sala 01',
      totalRevenue: 17500,
    },
    {
      id: 5,
      room: 'Sala 02',
      totalRevenue: 23500,
    },
    {
      id: 6,
      room: 'Sala 03',
      totalRevenue: 32500,
    },
  ],
};

const ROOMS_REVENUE_DETAILS_DATA: RoomRevenue[] = [
  {
    id: 1,
    room: 'Sala 01',
    totalRevenue: 17500,
    revenue: {
      byHour  : 1000,
      _3xWeek : 7500,
      byMonth : 9000,
    },
  },
  {
    id: 2,
    room: 'Sala 02',
    totalRevenue: 23500,
    revenue: {
      byHour  : 2000,
      _3xWeek : 8500,
      byMonth : 10000,
    },
  },
  {
    id: 3,
    room: 'Sala 03',
    totalRevenue: 32500,
    revenue: {
      byHour  : 3000,
      _3xWeek : 9500,
      byMonth : 11000,
    },
  },
  {
    id: 4,
    room: 'Sala 01',
    totalRevenue: 17500,
    revenue: {
      byHour  : 4000,
      _3xWeek : 10500,
      byMonth : 12000,
    },
  },
  {
    id: 5,
    room: 'Sala 02',
    totalRevenue: 23500,
    revenue: {
      byHour  : 5000,
      _3xWeek : 11500,
      byMonth : 13000,
    },
  },
  {
    id: 6,
    room: 'Sala 03',
    totalRevenue: 32500,
    revenue: {
      byHour  : 6000,
      _3xWeek : 12500,
      byMonth : 15000,
    },
  },
];

const RevenuesByRoom = (): React.JSX.Element => {

  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomRevenueDetails, setRoomRevenueDetails] = useState<Pick<RoomRevenue, 'room' | 'revenue'> | null>(null);

  const filteredList = useMemo(() => {
    const search = searchValue?.toLowerCase() ?? '';

    return ROOMS_REVENUE_DATA.roomsRevenue.filter((item) => item.room.toLowerCase().includes(search));
  }, [searchValue, ROOMS_REVENUE_DATA]);

  const handleGetRoomRevenueDetails = async(id:number): Promise<void> => {
    try {
      const roomRevenueDetails = ROOMS_REVENUE_DETAILS_DATA.find((room) => room.id === id);

      if (roomRevenueDetails) {
        setRoomRevenueDetails({
          room    : roomRevenueDetails.room,
          revenue : roomRevenueDetails.revenue,
        });
      }
    } catch (error:unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <LayoutWrapper>

      {errorMessage &&
        <Toast
          message={errorMessage ?? ''}
          onClose={() => setErrorMessage(null)}
          visible={!!errorMessage}
        />
      }

      {roomRevenueDetails && (
        <Modal.RoomRevenueDetails
          onRequestClose={() => setRoomRevenueDetails(null)}
          visible={!!roomRevenueDetails}
          roomData={roomRevenueDetails}
        />
      )}

      <SystemLayout
      title='Receitas por sala'
      description='Listagem das receitas por sala'
      tab='VALUES'
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
              renderItem={({ item, index }) => (
                <Label___Value
                  separationRow={filteredList.length - 1 !== index}
                  key={item.id}
                  label={item.room}
                  value={{ _: priceFormat(item.totalRevenue), color: 'text-green-600' }}
                  onTouch={() => handleGetRoomRevenueDetails(item.id)}
                />
              )}
            />
          </View>

          <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>
            <Label___Value
              value={{ 
                _: priceFormat(ROOMS_REVENUE_DATA.totalRevenue),
                color: 'text-green-600 text-lg'
              }}
              label='Receita total'
              boldLabel
            />  
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default RevenuesByRoom;