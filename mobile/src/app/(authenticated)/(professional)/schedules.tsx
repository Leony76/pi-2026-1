import { Card } from '@/components/card'
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

  const activeRentals = rentals.filter(r => r.isActive);
  const inactiveRentals = rentals.filter(r => !r.isActive);

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

                  {rental.allocationType === 'PER_HOUR' && rental.selectedHours ? (
                    <View className='flex-row gap-2 mb-3'>
                      <Card.EntryAndExit
                        hour={rental.selectedHours.startHour}
                        type='ENTRY'
                        dayMonthYear={formatSessionDate(rental.startDate)}
                      />

                      <Card.EntryAndExit
                        hour={rental.selectedHours.endHour}
                        type='EXIT'
                        dayMonthYear={formatSessionDate(rental.startDate)}
                      />         
                    </View>
                  ) : null}

                  <Label___Value
                    label='Tipo'
                    value={{ _: rental.allocationType === 'PER_HOUR' ? 'Por hora' : rental.allocationType === '3X_WEEK' ? '3x Semana' : 'Mensal' }}
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

          {inactiveRentals.length > 0 && (
            <Section title='Histórico'>
              {inactiveRentals.map((rental) => (
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
                        closed
                      />
                    </View>
                  </View>

                  <Label___Value
                    label='Tipo'
                    value={{ _: rental.allocationType === 'PER_HOUR' ? 'Por hora' : rental.allocationType === '3X_WEEK' ? '3x Semana' : 'Mensal' }}
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