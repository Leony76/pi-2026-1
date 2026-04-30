import { Button } from '@/components/button'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { Modal } from '@/components/modal'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { useAuth } from '@/contexts/auth.context'
import { ApiError } from '@/services/api'
import { EnterpriseValuesResponse, fetchEnterpriseValuesWithAuth } from '@/services/rooms'
import { priceFormat } from '@/utils/priceFormat'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'

const Values = (): React.JSX.Element => {

  const router = useRouter();
  const auth = useAuth();
  const [values, setValues] = useState<EnterpriseValuesResponse | null>(null);
  const [roomRevenueDetails, setRoomRevenueDetails] = useState<Pick<EnterpriseValuesResponse['roomRevenue']['roomsRevenue'][number], 'room' | 'revenue'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadValues() {
      if (!auth.token || !auth.refreshToken) {
        setError('Sessão inválida. Entre novamente para ver os valores.');
        setIsLoading(false);
        return;
      }

      const authenticated = {
        token: auth.token,
        refreshToken: auth.refreshToken,
        updateTokens: auth.updateTokens,
        signOut: auth.signOut,
      };

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchEnterpriseValuesWithAuth(authenticated);
        setValues(response);
      } catch (requestError) {
        setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível carregar os valores.');
      } finally {
        setIsLoading(false);
      }
    }

    loadValues();
  }, [auth]);

  if (isLoading) {
    return (
      <LayoutWrapper>
        <SystemLayout
          title='Valores'
          description='Receitas e despesas'
          layoutType='ENTERPRISE'
          tab='VALUES'
        >
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color='#1AAFB4' />
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <SystemLayout
          title='Valores'
          description='Receitas e despesas'
          layoutType='ENTERPRISE'
          tab='VALUES'
        >
          <View className='flex-1 items-center justify-center px-6'>
            <Text className='text-center text-red-500 font-nunito-bold'>
              {error}
            </Text>
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  const roomRevenueData = values?.roomRevenue.roomsRevenue ?? [];
  const roomPricesData = values?.roomPrices ?? [];

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
                { priceFormat(values?.summary.revenueThisMonth ?? 0) }
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Receita do mês
              </Text>
            </View>

            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-red-700 text-xl'>
                { '-' + priceFormat(values?.summary.expensesThisMonth ?? 0) }
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
            { roomRevenueData.length > 0 ? (
              roomRevenueData.map(( item ) => (
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
                _: priceFormat(values?.roomRevenue.totalRevenue ?? 0),
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
                _: '-' + priceFormat(values?.expenses.maintenance ?? 0),
                color: 'text-red-600'
              }}
              label='Manutenção das salas'
            />  
            
            <Label___Value
              separationRow
              value={{ 
                _: '-' + priceFormat(values?.expenses.eletricalEnergy ?? 0),
                color: 'text-red-600'
              }}
              label='Energia elétrica'
            />  

            <Label___Value
              separationRow
              value={{ 
                _: '-' + priceFormat(values?.expenses.cleaning ?? 0),
                color: 'text-red-600'
              }}
              label='Limpeza'
            />  

            <Label___Value
              value={{ 
                _: '-' + priceFormat(values?.expenses.totalValue ?? 0),
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
                { roomPricesData.length > 0 ? (
                  roomPricesData.map((item, index) => (
                    <Label___Value
                      separationRow={roomPricesData.length - 1 !== index}
                      key={`hour-${item.id}`}
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
                { roomPricesData.length > 0 ? (
                  roomPricesData.map((item, index) => (
                    <Label___Value
                      separationRow={roomPricesData.length - 1 !== index}
                      key={`week-${item.id}`}
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
                { roomPricesData.length > 0 ? (
                  roomPricesData.map((item, index) => (
                    <Label___Value
                      separationRow={roomPricesData.length - 1 !== index}
                      key={`month-${item.id}`}
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