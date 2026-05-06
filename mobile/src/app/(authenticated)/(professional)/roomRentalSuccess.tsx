import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import { Text, View, ActivityIndicator } from 'react-native'
import Label___Value from '@/components/ui/Label___Value';
import { Allocation } from '@/types/allocation.type';
import { priceFormat } from '@/utils/priceFormat';
import { Button } from '@/components/button';
import { useAuth } from '@/contexts/auth.context';
import { createRoomRentalWithAuth } from '@/services/rooms';

const roomRentalSuccess = (): React.JSX.Element => {

  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();

  const roomId = params.roomId as string ?? '';
  const roomName = params.roomName as string ?? '[Nome não provido]';
  const allocationType = params.allocationType as Allocation;
  const paymentMethod = params.paymentMethod as 'PIX' | 'BANK_SLIP' | 'CREDIT_CARD' | undefined;
  const pricePaid = params.pricePaid as unknown as number ?? 0;
  const dateParam = params.date as string | undefined;
  const selectedDate = React.useMemo(() => (dateParam ? new Date(dateParam) : null), [dateParam]);

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
        const startDate = selectedDate ? new Date(selectedDate) : new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);

              if (allocationType === 'DAILY') {
                endDate.setDate(endDate.getDate() + 1);
              } else if (allocationType === 'WEEK') {
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
  }, [token, refreshToken, updateTokens, signOut, roomId, allocationType, paymentMethod, pricePaid, selectedDate]);

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

            { allocationType === 'DAILY' ? (
              <Label___Value
                separationRow
                label='Dia'
                value={{ _: selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '-' }}
              />
            ) : allocationType === 'MONTH' ? (
              <Label___Value
                separationRow
                label='Período'
                value={{ _: '1 mês' }}
              />
            ) : allocationType === 'WEEK' ? (
              <Label___Value
                separationRow
                label='Semana'
                value={{
                  _:
                    selectedDate
                      ? `${selectedDate.toLocaleDateString('pt-BR')} - ${new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 6)).toLocaleDateString('pt-BR')}`
                      : '-',
                }}
              />
            ) : (
              <Label___Value
                separationRow
                label='Período'
                value={{ _: '1 mês' }}
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