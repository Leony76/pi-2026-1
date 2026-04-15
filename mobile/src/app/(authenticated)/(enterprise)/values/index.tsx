import { Button } from '@/components/button'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { Modal } from '@/components/modal'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { Expanses } from '@/types/expenses.type'
import { RoomPrice } from '@/types/roomPrice.type'
import { OverallRoomRevenue, RoomRevenue } from '@/types/roomRevenue.type'
import { priceFormat } from '@/utils/priceFormat'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

const ROOMS_REVENUE_DATA: OverallRoomRevenue = {
  totalRevenue: 534322,
  roomsRevenue: [
    {
      id: 1,
      room: 'Sala 01',
      totalRevenue: 17500,
      revenue: {
        byHour  : 1000,
        _3xWeek : 7500,
        byMonth : 9000,
      }
    },
    {
      id: 2,
      room: 'Sala 02',
      totalRevenue: 23500,
      revenue: {
        byHour  : 1200,
        _3xWeek : 8500,
        byMonth : 13000,
      }
    },
    {
      id: 3,
      room: 'Sala 03',
      totalRevenue: 32500,
      revenue: {
        byHour  : 1400,
        _3xWeek : 9500,
        byMonth : 15000,
      }
    },
  ],
};

const EXPENSES_DATA: Expanses = {
  cleaning: 180,
  eletricalEnergy: 140,
  maintenance: 120,
  totalValue: 440,
}

const ROOMS_PRICES_DATA: RoomPrice[] = [
  {
    id: 1,
    room: 'Sala 01',
    price: {
      byHour  : 1000,
      _3xWeek : 7500,
      byMonth : 9000,
    },
  },
  {
    id: 2,
    room: 'Sala 02',
    price: {
      byHour  : 2000,
      _3xWeek : 8500,
      byMonth : 10000,
    },
  },
  {
    id: 3,
    room: 'Sala 03',
    price: {
      byHour  : 3000,
      _3xWeek : 9500,
      byMonth : 11000,
    },
  },
];

const Values = (): React.JSX.Element => {

  const router = useRouter();
  const [roomRevenueDetails, setRoomRevenueDetails] = useState<Pick<RoomRevenue, 'room' | 'revenue'> | null>(null);

  return (
    <LayoutWrapper>

      {roomRevenueDetails && (
        <Modal.RoomRevenueDetails
          onRequestClose={() => setRoomRevenueDetails(null)}
          visible={!!roomRevenueDetails}
          roomData={roomRevenueDetails}
        />
      )}

      <SystemLayout 
      title='Valores' 
      description={'Receitas e despesas'} 
      layoutType={'ENTERPRISE'}      
      tab='VALUES'
      > 
        <ScrollView contentContainerClassName='py-6 gap-5'>
          <View className='flex-row justify-between gap-3'>
            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-green-600 text-xl'>
                { '-' + priceFormat(4200.67) }
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Receita do mês
              </Text>
            </View>

            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-red-700 text-xl'>
                { '-' + priceFormat(157.66) }
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Despesas
              </Text>
            </View>           
          </View>

          <Section 
          title='Receitas por sala'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.push('/(authenticated)/(enterprise)/values/revenuesByRoom')}
              customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
            />
          )}
          >
            { ROOMS_REVENUE_DATA.roomsRevenue.length > 0 ? (
              ROOMS_REVENUE_DATA.roomsRevenue.map(( item ) => (
                <Label___Value
                  separationRow
                  key={item.id}
                  label={item.room}
                  value={{ _: priceFormat(item.totalRevenue), color: 'text-green-600' }}
                  onTouch={() => setRoomRevenueDetails({
                    room    : item.room,
                    revenue : item.revenue,
                  })}
                />
              ))
            ) : (
              <ContentNotFound text='Nenhuma receita por sala'/>
            )}

            <Label___Value
              value={{ 
                _: priceFormat(ROOMS_REVENUE_DATA.totalRevenue),
                color: 'text-green-600 text-lg'
              }}
              label='Receita total'
              boldLabel
            />          
          </Section>

          <Section title='Despesas'>
            <Label___Value
              separationRow
              value={{ 
                _: '-' + priceFormat(EXPENSES_DATA.maintenance),
                color: 'text-red-600'
              }}
              label='Manutenção das salas'
            />  
            
            <Label___Value
              separationRow
              value={{ 
                _: '-' + priceFormat(EXPENSES_DATA.eletricalEnergy),
                color: 'text-red-600'
              }}
              label='Energia elétrica'
            />  

            <Label___Value
              separationRow
              value={{ 
                _: '-' + priceFormat(EXPENSES_DATA.cleaning),
                color: 'text-red-600'
              }}
              label='Limpeza'
            />  

            <Label___Value
              value={{ 
                _: '-' + priceFormat(EXPENSES_DATA.totalValue),
                color: 'text-red-600 text-lg'
              }}
              label='Despesas totais'
              boldLabel
            />  
          </Section>

          <Section 
          title='preços por sala'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.push('/(authenticated)/(enterprise)/values/pricesByRoom')}
              customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
            />
          )}
          >
            <View className='gap-3'>
              <Text className='font-nunito-bold text-medroom-primary text-center text-xl'>
                Por hora
              </Text>

              <View className='gap-3'>
                { ROOMS_PRICES_DATA.length > 0 ? (
                  ROOMS_PRICES_DATA.map((item, index) => (
                    <Label___Value
                      separationRow={ROOMS_PRICES_DATA.length - 1 !== index}
                      value={{ _: priceFormat(item.price.byHour ?? 0), color: 'text-green-600'}}
                      label={ item.room }
                    /> 
                  ))
                ) : (
                  <ContentNotFound text='Nenhum preço por hora'/>
                )}
              </View>

              <Text className='font-nunito-bold text-medroom-primary text-center text-xl'>
                3x semana
              </Text>

              <View className='gap-3'>
                { ROOMS_PRICES_DATA.length > 0 ? (
                  ROOMS_PRICES_DATA.map((item, index) => (
                    <Label___Value
                      separationRow={ROOMS_PRICES_DATA.length - 1 !== index}
                      value={{ _: priceFormat(item.price._3xWeek ?? 0), color: 'text-green-600'}}
                      label={ item.room }
                    /> 
                  ))
                ) : (
                  <ContentNotFound text='Nenhum preço por hora'/>
                )}
              </View>

              <Text className='font-nunito-bold text-medroom-primary text-center text-xl'>
                Por mês
              </Text>

              <View className='gap-3'>
                { ROOMS_PRICES_DATA.length > 0 ? (
                  ROOMS_PRICES_DATA.map((item, index) => (
                    <Label___Value
                      separationRow={ROOMS_PRICES_DATA.length - 1 !== index}
                      value={{ _: priceFormat(item.price.byMonth ?? 0), color: 'text-green-600'}}
                      label={ item.room }
                    /> 
                  ))
                ) : (
                  <ContentNotFound text='Nenhum preço por hora'/>
                )}
              </View>
            </View>
          </Section>
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Values