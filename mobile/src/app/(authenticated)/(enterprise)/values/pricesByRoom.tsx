import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import { Allocation } from '@/types/allocation.type'
import { RoomRevenue } from '@/types/roomRevenue.type'
import { priceFormat } from '@/utils/priceFormat'
import { Router, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'

// Supondo que virá essas informações da API (Completa)

const ROOMS_PRICES_DATA: Omit<RoomRevenue, 'totalRevenue'>[] = [
  {
    id: 1,
    room: 'Sala 01',
    revenue: {
      byHour  : 1000,
      _3xWeek : 7500,
      byMonth : 9000,
    },
  },
  {
    id: 2,
    room: 'Sala 02',
    revenue: {
      byHour  : 2000,
      _3xWeek : 8500,
      byMonth : 10000,
    },
  },
  {
    id: 3,
    room: 'Sala 03',
    revenue: {
      byHour  : 3000,
      _3xWeek : 9500,
      byMonth : 11000,
    },
  },
  {
    id: 4,
    room: 'Sala 01',
    revenue: {
      byHour  : 4000,
      _3xWeek : 10500,
      byMonth : 12000,
    },
  },
  {
    id: 5,
    room: 'Sala 02',
    revenue: {
      byHour  : 5000,
      _3xWeek : 11500,
      byMonth : 13000,
    },
  },
  {
    id: 6,
    room: 'Sala 03',
    revenue: {
      byHour  : 6000,
      _3xWeek : 12500,
      byMonth : 15000,
    },
  },
];

const PricesByRoom = (): React.JSX.Element => {

  const router: Router = useRouter();
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [pricesRender, setPricesRender] = useState<Allocation>('PER_HOUR');

  const filteredList = useMemo(() => {
    const search = searchValue?.toLowerCase() ?? '';

    return ROOMS_PRICES_DATA.filter((item) => item.room.toLowerCase().includes(search));
  }, [searchValue, ROOMS_PRICES_DATA]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Preços por sala'
      description='Listagem dos preços por sala'
      tab='VALUES'
      goBack={() => router.back()}
      layoutType='ENTERPRISE'    
      >
        <View className='flex-1 py-6 gap-5'>
          <View className='flex-row justify-between gap-3'>
            <Button.Default
              label='Por hora'
              filled={pricesRender === 'PER_HOUR'}
              onTouch={() => setPricesRender('PER_HOUR')}
              customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
            />

            <Button.Default
              label='3x Semana'
              filled={pricesRender === '3X_WEEK'}
              onTouch={() => setPricesRender('3X_WEEK')}
              customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
            />

            <Button.Default
              label='Mês'
              filled={pricesRender === 'MONTH'}
              onTouch={() => setPricesRender('MONTH')}
              customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
            />
          </View>

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
              renderItem={({ item, index }) => {
                
                const ALLOCATION_TYPE_PRICE_MAP: Record<Allocation, number | undefined> = {
                  PER_HOUR  : item.revenue?.byHour,
                  '3X_WEEK' : item.revenue?._3xWeek,
                  MONTH     : item.revenue?.byMonth, 
                };
                
                const allocationTypePrice = ALLOCATION_TYPE_PRICE_MAP[pricesRender] ?? 0;

                return (
                  <Label___Value
                    separationRow={filteredList.length - 1 !== index}
                    key={item.id}
                    label={item.room}
                    value={{ _: priceFormat(allocationTypePrice), color: 'text-green-600' }}
                  />
              )}}
            />
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default PricesByRoom;