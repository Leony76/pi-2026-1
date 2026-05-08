import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import Icon from '@/components/ui/Icon'
import { systemColors } from '@/constants/misc/systemColors.misc'
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
              <Icon name='x_circle' color={'#EF4444'} sizes={{ width: 36, height: 36 }} />
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

          <View className='bg-medroom-primaryLight rounded-full p-3 w-32 h-32 justify-center items-center'>
            <Icon name='check' color={systemColors.primary} sizes={{ width: 36, height: 36 }} />
          </View>

          <Text className='font-nunito-bold text-2xl text-medroom-primary'>
            Tudo certo! 🎉
          </Text>

          <Text className='font-nunito text-medroom-secondary text-center'>
            Sua reserva foi confirmada.
          </Text>

          <View className='w-full rounded-xl overflow-hidden mt-6 border border-medroom-primaryLight bg-white'>
            <View className='bg-medroom-primaryLight px-4 py-4 flex-row items-center justify-between'>
              <Text className='font-nunito-bold text-medroom-primary text-sm'>Reserva #RES-{new Date().getFullYear()}-0847</Text>
              <View className='flex-row items-center gap-1 bg-medroom-primary px-3 py-1 rounded-full'>
                <Icon name='check' color='#ffffff' sizes={{ width: 12, height: 12 }} />
                <Text className='text-[10px] text-white font-nunito-bold uppercase'>Pago</Text>
              </View>
            </View>

            <View className='p-5 gap-3'>
              <View className='flex-row justify-between items-center'>
                <Text className='text-medroom-secondary font-nunito'>Sala</Text>
                <Text className='text-medroom-primary font-nunito-bold'>{roomName}</Text>
              </View>

              {allocationType === 'MONTH' ? (
                <>
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-medroom-secondary font-nunito'>Período</Text>
                    <Text className='text-medroom-primary font-nunito-bold'>
                      {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()) : '-'}
                    </Text>
                  </View>
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-medroom-secondary font-nunito'>Início</Text>
                    <Text className='text-medroom-primary font-nunito-bold'>{selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '-'}</Text>
                  </View>
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-medroom-secondary font-nunito'>Término</Text>
                    <Text className='text-medroom-primary font-nunito-bold'>{selectedDate ? new Date(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth() + 1, 0).toLocaleDateString('pt-BR') : '-'}</Text>
                  </View>
                </>
              ) : allocationType === 'WEEK' ? (
                <>
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-medroom-secondary font-nunito'>Período</Text>
                    <Text className='text-medroom-primary font-nunito-bold'>Na Semana</Text>
                  </View>
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-medroom-secondary font-nunito'>Início</Text>
                    <Text className='text-medroom-primary font-nunito-bold'>{selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '-'}</Text>
                  </View>
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-medroom-secondary font-nunito'>Término</Text>
                    <Text className='text-medroom-primary font-nunito-bold'>{selectedDate ? new Date(new Date(selectedDate).setDate(selectedDate.getDate() + 6)).toLocaleDateString('pt-BR') : '-'}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View className='flex-row justify-between items-center'>
                    <Text className='text-medroom-secondary font-nunito'>Dia</Text>
                    <Text className='text-medroom-primary font-nunito-bold'>{selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '-'}</Text>
                  </View>
                </>
              )}

              <View className='h-[1px] border-t border-dashed border-medroom-primaryLight my-2' />

              <View className='flex-row justify-between items-center'>
                <Text className='text-medroom-secondary font-nunito'>Forma de pagamento</Text>
                <View className='bg-white px-2 py-1 rounded-full flex-row items-center gap-1 border border-medroom-primaryLight'>
                  <Icon name={paymentMethod === 'PIX' ? 'pix' : paymentMethod === 'CREDIT_CARD' ? 'credit_card' : 'money'} color={systemColors.primary} sizes={{ width: 14, height: 14 }} />
                  <Text className='text-medroom-primary font-nunito-bold text-xs uppercase'>
                      {paymentMethod === 'PIX' ? 'Pix' : paymentMethod === 'CREDIT_CARD' ? 'Cartão' : 'Boleto'}
                  </Text>
                </View>
              </View>

              <View className='flex-row justify-between items-center mt-2'>
                <Text className='text-medroom-secondary font-nunito-bold text-base'>Valor pago</Text>
                <Text className='text-medroom-primary font-nunito-bold text-xl'>{priceFormat(pricePaid)}</Text>
              </View>
            </View>
          </View>

          <View className='w-full gap-3 mt-4 pb-8'>
            <Button.Default
              label='Ver meus horários'
              onTouch={() => router.replace('/(authenticated)/(professional)/schedules')}
              customStyle={{ container: 'w-full bg-white border border-medroom-primary py-4 rounded-xl', text: 'text-medroom-primary text-base font-nunito-bold' }}
              icon={{ name: 'schedule', color: systemColors.primary }}
            />
            <Button.Default
              label='Voltar ao início'
              onTouch={() => router.replace('/(authenticated)/(professional)/home')}
              customStyle={{ container: 'w-full bg-white border border-medroom-primary py-4 rounded-xl', text: 'text-medroom-primary text-base font-nunito-bold' }}
            />
          </View>
        </View>
      </View>
    </LayoutWrapper>
  )
}

export default roomRentalSuccess