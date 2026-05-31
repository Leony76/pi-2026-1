import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import AvailbilityTag from '@/components/ui/AvailbilityTag'
import Icon from '@/components/ui/Icon'
import Label___Value from '@/components/ui/Label___Value'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { priceFormat } from '@/utils/priceFormat'
import React, { useEffect, useState } from 'react'
import { ScrollView, Text, View, ActivityIndicator } from 'react-native'
import { useAuth } from '@/contexts/auth.context'
import { RoomService } from '@/services/rooms'
import { formatSessionDate } from '@/utils/formatSessionDate'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { RoomRental } from '@/types/room/roomRental.type'
import { AuthHandlers } from '@/types/auth/authHandlers.type'
import { formatDayMonth } from '@/utils/formatDayMonth'
import { formatFullDayRange } from '@/utils/formatFullDayRange'
import { Allocation } from '@/types/room/allocation.type'
import { formatDayMonthYear } from '@/utils/formatDayMonthYear'
import { formatDate } from '@/utils/formatDate'

const schedules = (): React.JSX.Element => {
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [rentals, setRentals] = useState<RoomRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRentals = async () => {
      if (!token || !refreshToken) {
        setError('Não autenticado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const authHandlers: AuthHandlers = {
          token,
          refreshToken,
          updateTokens,
          signOut,
        };

        const data = await RoomService.fetchUserRentals(authHandlers);

        setRentals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar horários');
        console.error('Erro ao carregar horários:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRentals();
  }, [token, refreshToken, updateTokens, signOut]);

  

  if (loading) {
    return (
      <LayoutWrapper>
        <SystemLayout
        title='Meus horários'
        description='Entradas, saídas, sessões'
        tab='SCHEDULES'
        layoutType='PROFESSIONAL'    
        >
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <SystemLayout
        title='Meus horários'
        description='Entradas, saídas, sessões'
        tab='SCHEDULES'
        layoutType='PROFESSIONAL'    
        >
          <View className='flex-1 justify-center items-center'>
            <Text className='text-red-500 text-center'>{error}</Text>
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  const now = new Date();
  const getRentalEnd = (rental: RoomRental) => new Date(rental.endDate);

  const getAllocationLabel = (allocationType: Allocation) => {
    switch (allocationType) {
      case 'DAILY' : return 'Por dia';
      case 'MONTH' : return 'Mensal';
      default      : return 'Por semana';
    }
  };

  const occupationPeriodDisplayFormatByAllocationType = (
    allocationType : Allocation,
    startDate      : string | Date,
    endDate        : string | Date,
  ) => {
    switch (allocationType) {
      case 'DAILY' : return formatFullDayRange(startDate, true);
      default      : return formatDate(startDate) + ' à ' + formatDate(endDate);   
    }
  } 

  const activeRentals = rentals.filter(r => {
    const end = getRentalEnd(r);
    return end >= now;
  });

  const closedRentals = rentals.filter(r => {
    const end = getRentalEnd(r);
    return end < now;
  });


  return (
    <LayoutWrapper>
      <SystemLayout
      title='Meus horários'
      description='Entradas, saídas, sessões'
      tab='SCHEDULES'
      layoutType='PROFESSIONAL'    
      >
        <ScrollView contentContainerClassName='py-5 gap-5'>
          {activeRentals.length > 0 && (
            <>
            <Text className='text-medroom-secondary text-lg font-nunito-bold'>
              ATIVOS AGORA
            </Text>
              {activeRentals.map((rental) => (
                <View 
                key={rental.id}
                className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3`}
                >
                  <View className='flex-row justify-between items-center'>
                    <View>
                      <Text className='font-nunito-bold text-medroom-primary text-xl'>
                        {rental.roomTitle}
                      </Text>

                      <View className='flex-row items-center gap-1'>
                        <Icon
                          name='schedule'
                          sizes={{ width: 20, height: 20 }}
                          color={systemColors.secondary}
                        />

                        <Text className='text font-nunito-bold text-medroom-secondary'>
                          { 
                            occupationPeriodDisplayFormatByAllocationType(
                              rental.allocationType,
                              rental.startDate,
                              rental.endDate,
                            ) 
                          }
                        </Text>
                      </View>
                    </View>

                    <View className='self-start'>
                      <AvailbilityTag
                        tagType='ACTIVITY'
                        isAvailable
                      />
                    </View>
                  </View>

                  <Label___Value
                    label='Tipo'
                    value={{ _: getAllocationLabel(rental.allocationType) }}
                    separationRow
                  />

                  <Label___Value
                    label='Valor'
                    value={{ _: priceFormat(rental.totalPrice), color: 'text-green-600' }}
                    boldLabel
                  />
                </View>
              ))}
            </>
          )}

          {closedRentals.length > 0 && (
            <>
              <Text className='text-medroom-secondary text-lg font-nunito-bold'>
                ENCERRADO
              </Text>

              {closedRentals.map((rental) => (
                <View 
                key={rental.id}
                className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3`}
                >
                  <View className='flex-row justify-between items-center'>
                    <View>
                      <Text className='font-nunito-bold text-medroom-primary text-xl'>
                        {rental.roomTitle}
                      </Text>

                      <View className='flex-row items-center gap-1'>
                        <Icon
                          name='schedule'
                          sizes={{ width: 20, height: 20 }}
                          color={systemColors.secondary}
                        />

                        <Text className='text font-nunito-bold text-medroom-secondary'>
                          {formatSessionDate(rental.startDate)}  até  {formatSessionDate(rental.endDate)}
                        </Text>
                      </View>
                    </View>

                    <View className='self-start'>
                      <AvailbilityTag
                        tagType='ACTIVITY'
                        isAvailable={false}
                        closed={getRentalEnd(rental) < new Date()}
                      />
                    </View>
                  </View>

                  <Label___Value
                    label='Tipo'
                    value={{ _: getAllocationLabel(rental.allocationType) }}
                    separationRow
                  />

                  <Label___Value
                    label='Valor'
                    value={{ _: priceFormat(rental.totalPrice), color: 'text-green-600' }}
                    boldLabel
                  />
                </View>
              ))}
            </>
          )}

          {rentals.length === 0 && (
            <View className='fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]'>
              <ContentNotFound text='Nenhuma reserva encontrada!'/>
            </View>
          )}
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default schedules