import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { Days } from '@/types/days.type'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import { Text, View, ActivityIndicator } from 'react-native'
import Label___Value from '@/components/ui/Label___Value';
import { Allocation } from '@/types/allocation.type';
import { TRANSLATED_DAYS_MAP } from '@/constants/maps/translatedDays.map';
import { priceFormat } from '@/utils/priceFormat';
import { Button } from '@/components/button';
import { useAuth } from '@/contexts/auth.context';
import { createRoomRentalWithAuth } from '@/services/rooms';

function parseHourToMinutes(hour: string): number {
  const [hoursString = '0', minutesString = '0'] = hour.split(':');
  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  return (hours * 60) + minutes;
}

function buildDateFromHour(baseDate: Date, hour: string): Date {
  const [hoursString = '0', minutesString = '0'] = hour.split(':');
  const hours = Number(hoursString);
  const minutes = Number(minutesString);
  const date = new Date(baseDate);

  date.setHours(hours, minutes, 0, 0);

  return date;
}

const roomRentalSuccess = (): React.JSX.Element => {

  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();

  const roomId = params.roomId as string ?? '';
  const roomName = params.roomName as string ?? '[Nome não provido]';
  const allocationType = params.allocationType as Allocation;
  const paymentMethod = params.paymentMethod as 'PIX' | 'BANK_SLIP' | 'CREDIT_CARD' | undefined;
  const startHour = params.startHour as string ?? '[Entrada não provida]';
  const endHour = params.endHour as string ?? '[Saída não provida]';
  const pricePaid = params.pricePaid as unknown as number ?? 0;
  const daysParam = params.days as string | undefined;
  const days: Days[] = React.useMemo(
    () => (daysParam ? JSON.parse(daysParam) : []),
    [daysParam]
  );

  const [isSaving, setIsSaving] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hasSavedRental = React.useRef(false);

  useEffect(() => {
    const saveRental = async () => {
      if (hasSavedRental.current) {
        return;
      }

      if (!token || !refreshToken || !roomId) {
        setSaveError('Erro ao salvar reserva: dados insuficientes');
        setIsSaving(false);
        return;
      }

      hasSavedRental.current = true;

      try {
        const startDate = new Date();
        const endDate = new Date(startDate);

        if (allocationType === 'PER_HOUR') {
          const startDateFromSelection = buildDateFromHour(startDate, startHour);
          const endDateFromSelection = buildDateFromHour(startDate, endHour);

          if (parseHourToMinutes(endHour) <= parseHourToMinutes(startHour)) {
            endDateFromSelection.setDate(endDateFromSelection.getDate() + 1);
          }

          await createRoomRentalWithAuth(
            {
              roomId,
              allocationType,
              paymentMethod,
              startDate: startDateFromSelection,
              endDate: endDateFromSelection,
              totalPrice: pricePaid,
              selectedHours: { startHour, endHour },
            },
            { token, refreshToken, updateTokens, signOut }
          );

          setIsSaving(false);
          return;
        } else if (allocationType === '3X_WEEK') {
          endDate.setDate(endDate.getDate() + 7);
        } else if (allocationType === 'MONTH') {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        await createRoomRentalWithAuth(
          {
            roomId,
            allocationType,
            paymentMethod,
            startDate,
            endDate,
            totalPrice: pricePaid,
            selectedWeekDays: allocationType === '3X_WEEK' 
              ? days
              : undefined,
          },
          { token, refreshToken, updateTokens, signOut }
        );
        setIsSaving(false);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Erro ao salvar reserva');
        setIsSaving(false);
      }
    };

    saveRental();
  }, [token, refreshToken, updateTokens, signOut, roomId, allocationType, paymentMethod, startHour, endHour, pricePaid, days]);

  if (isSaving) {
    return (
      <LayoutWrapper>
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className='mt-4 text-medroom-secondary'>Salvando reserva...</Text>
        </View>
      </LayoutWrapper>
    );
  }

  if (saveError) {
    return (
      <LayoutWrapper>
        <View className='flex-1 justify-center items-center'>
          <View className='w-[80%] items-center gap-5'>
            <View className='bg-red-100 rounded-full p-3 w-32 h-32 justify-center items-center'>
              <AntDesign 
                name="close" 
                size={36} 
                color="red" 
              />
            </View>
            <Text className='font-nunito-bold text-2xl text-red-600'>Erro!</Text>
            <Text className='font-nunito text-medroom-secondary text-center'>{saveError}</Text>
            <Button.Default
              label='Voltar'
              onTouch={() => router.back()}
              filled
              customStyle={{ container: 'w-full' }}
            />
          </View>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <View className='flex-1 justify-center items-center'>
        <View className='w-[80%] items-center gap-5'>
          <View className='bg-green-100 rounded-full p-3 w-32 h-32 justify-center items-center'>
            <AntDesign 
              name="check" 
              size={36} 
              color="green" 
            />
          </View>

          <Text className='font-nunito-bold text-2xl text-medroom-primary'>
            Reserva confirmada!
          </Text>

          <Text className='font-nunito text-medroom-secondary text-center'>
            Sua { roomName } foi reservada! Você receberá os detalhes por e-mail. 
          </Text>

          <View className='border-2 gap-3 border-medroom-primaryLight rounded-xl p-4 w-full'>
            <Label___Value
              separationRow
              label='Sala'
              value={{ _: roomName }}
            />

            { allocationType === 'PER_HOUR' ? (
              <>
                <Label___Value
                  separationRow
                  label='Entrada'
                  value={{ _: startHour }}
                />

                <Label___Value
                  separationRow
                  label='Saída'
                  value={{ _: endHour }}
                />
              </>
            ) : allocationType === 'MONTH' ? (
              <Label___Value
                separationRow
                label='Período'
                value={{ _: '1 mês' }}
              />
            ) : (    
              <Label___Value
                separationRow
                label='Dias'
                value={{ 
                  _:TRANSLATED_DAYS_MAP[days.at(0)!].split('-')[0]  
                  + ', ' 
                  + TRANSLATED_DAYS_MAP[days.at(1)!].split('-')[0] 
                  + ' e ' 
                  + TRANSLATED_DAYS_MAP[days.at(2)!].split('-')[0] 
                }}
              />
            )}

            <Label___Value
              boldLabel
              label='Valor pago'
              value={{ 
                _     : priceFormat(pricePaid),
                color : 'text-green-600' 
              }}
            />
          </View>

          <Button.Default
            label='Ver meus horários'
            onTouch={() => router.replace('/(authenticated)/(professional)/schedules')}
            filled
            customStyle={{ container: 'w-full' }}
            icon={{ name: 'schedule' }}
          />
        </View>
      </View>
    </LayoutWrapper>
  )
}

export default roomRentalSuccess