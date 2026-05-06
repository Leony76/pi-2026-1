import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import AvailbilityTag from '@/components/ui/AvailbilityTag'
import Icon from '@/components/ui/Icon'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { priceFormat } from '@/utils/priceFormat'
import React, { useEffect, useState } from 'react'
import { ScrollView, Text, View, ActivityIndicator } from 'react-native'
import { useAuth } from '@/contexts/auth.context'
import { fetchUserRentalsWithAuth, RoomRental } from '@/services/rooms'
import { formatSessionDate } from '@/utils/formatSessionDate'

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
        const data = await fetchUserRentalsWithAuth({
          token,
          refreshToken,
          updateTokens,
          signOut,
        });
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

  const getAllocationLabel = (allocationType: RoomRental['allocationType']) => {
    if (allocationType === 'DAILY') {
      return 'Por dia';
    }

    if (allocationType === 'WEEK') {
      return 'Por semana';
    }

    return 'Mensal';
  };

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
            <Section title='Ativo agora'>
              {activeRentals.map((rental) => (
                <View key={rental.id}>
                  <View className='flex-row justify-between items-center mb-3'>
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
                          {formatSessionDate(rental.startDate)}
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
            </Section>
          )}

          {closedRentals.length > 0 && (
            <Section title='Encerrado'>
              {closedRentals.map((rental) => (
                <View key={rental.id} className='mb-5'>
                  <View className='flex-row justify-between items-center mb-3'>
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
                          {formatSessionDate(rental.startDate)} até {formatSessionDate(rental.endDate)}
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
            </Section>
          )}

          {rentals.length === 0 && (
            <View className='flex-1 justify-center items-center'>
              <Text className='text-medroom-secondary'>Nenhuma reserva encontrada</Text>
            </View>
          )}
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default schedules