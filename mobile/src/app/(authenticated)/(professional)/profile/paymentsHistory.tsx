import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { useAuth } from '@/contexts/auth.context'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useLoggedUserData } from '@/contexts/LoggedUserData.context'
import { decrementHoursFromStringDate } from '@/utils/decrementHoursFromStringDate'
import { FetchProfessionalPaymentsHistory } from '@/types/payment/fetchProfessionalPaymentsHistory.type'
import { PaymentService } from '@/services/payments'
import { AuthHandlers } from '@/types/auth/authHandlers.type'

const PaymentHistory = (): React.JSX.Element => {

  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const { profile } = useLoggedUserData();
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [paymentsHistory, setPaymentsHistory] = useState<FetchProfessionalPaymentsHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async (): Promise<void> => {
      if (!token || !refreshToken || !profile) {
        setError('Não autenticado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const authHandlers: AuthHandlers = { 
          refreshToken,
          token,
          signOut,
          updateTokens,
        };

        const data = await PaymentService.fetchLoggedProfessionalPaymentsHistory(
          profile.id, 
          authHandlers,
        );

        setPaymentsHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar histórico de pacientes');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [token, refreshToken, updateTokens, signOut]);

  const filteredList = useMemo(() => 
    paymentsHistory.filter((payment) => payment.paid.toString().toLowerCase().includes(searchValue?.toLowerCase() ?? '')), 
  [searchValue, paymentsHistory]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Histórico de pagamentos'
      description='Histórico de suas transações'
      tab='PROFILE'
      goBack={() => router.push('/(authenticated)/(professional)/profile')}
      layoutType='PROFESSIONAL'    
      >
        {isLoading ? (
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size='large' color='#3b82f6' />
          </View>
        ) : error ? (
          <View className='flex-1 justify-center items-center'>
            <Text className='text-red-500 text-center'>{error}</Text>
          </View>
        ) : (
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
              ListEmptyComponent={ <ContentNotFound text={searchValue ? `Nenhum resultado para "${ searchValue }"` : 'Nenhum transação realizado até o momento!'}/> }
              renderItem={({ item, index }) => (
                <Card.PaymentHistory
                  key={item.id}
                  { ...item }
                  createdAt={decrementHoursFromStringDate(item.createdAt, 3).toISOString()}
                  gap={'gap-3'}
                  separationRow={(filteredList.length - 1) !== index}
                />
              )}
            />
          </View>
        </View>
        )}
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default PaymentHistory