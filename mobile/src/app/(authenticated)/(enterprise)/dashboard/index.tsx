import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useAuth } from '@/contexts/auth.context'
import { ApiError } from '@/services/api'
import { EnterpriseService } from '@/services/enterprise'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { EnterpriseDashboardResponse } from '@/types/metrics/enterpriseDashboardResponse.type'
import { AuthHandlers } from '@/types/auth/authHandlers.type'

const Home = (): React.JSX.Element => {

  const router = useRouter();
  const auth = useAuth();
  const [dashboard, setDashboard] = useState<EnterpriseDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!auth.token || !auth.refreshToken) {
        setError('Sessão inválida. Entre novamente para ver o painel.');
        setIsLoading(false);
        return;
      }

      const authHandlers: AuthHandlers = {
        token        : auth.token,
        refreshToken : auth.refreshToken,
        updateTokens : auth.updateTokens,
        signOut      : auth.signOut,
      };

      try {
        setIsLoading(true);
        setError(null);

        const response = await EnterpriseService.fetchEnterpriseDashboard(authHandlers);
        
        setDashboard(response);
      } catch (requestError) {
        setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível carregar o painel.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [auth]);

  const occupationPreview = dashboard?.roomOccupation ?? [];

  if (isLoading) {
    return (
      <LayoutWrapper>
        <SystemLayout 
          title='Painel da empresa' 
          description='Visão geral - hoje' 
          layoutType={'ENTERPRISE'}      
          tab='DASHBOARD'
        > 
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color={systemColors.primary} />
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <SystemLayout 
          title='Painel da empresa' 
          description='Visão geral - hoje' 
          layoutType={'ENTERPRISE'}      
          tab='DASHBOARD'
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

  return (
    <LayoutWrapper>
      <SystemLayout 
      title='Painel da empresa' 
      description={'Visão geral - hoje'} 
      layoutType={'ENTERPRISE'}      
      tab='DASHBOARD'
      > 
        <ScrollView contentContainerClassName='py-6 gap-5'>
          <View className='flex-row justify-between gap-3'>
            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-medroom-primary text-4xl'>
                {dashboard?.stats.totalRooms ?? 0}
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Salas totais
              </Text>
            </View>

            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-green-600 text-4xl'>
                {dashboard?.stats.availableRooms ?? 0}
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Disponíveis
              </Text>
            </View>

            <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
              <Text className='font-nunito-bold text-red-700 text-4xl'>
                {dashboard?.stats.occupiedRooms ?? 0}
              </Text>

              <Text className='font-nunito-bold text-medroom-secondary text-sm'>
                Oculpadas
              </Text>
            </View>
          </View>

          <View className='gap-5'>
            <Text className='text-medroom-secondary text-lg font-nunito-bold'>
              MOVIMENTAÇÃO HOJE
            </Text>

            <View className='flex-row gap-3'>
              <View className={`border-2 flex-1 p-3 px-5 rounded-xl border-medroom-primaryLight`}>
                <Text className='text-medroom-secondary font-nunito-bold text-base'>
                  Entradas
                </Text>
          
                <Text className={`text-3xl font-nunito-bold text-green-600`}>
                    {dashboard?.stats.entriesToday ?? 0}
                </Text>
          
                <Text className='text-medroom-secondary text-sm font-nunito-bold'>
                  Profissionais hoje
                </Text>
              </View>

              <View className={`border-2 flex-1 p-3 px-5 rounded-xl border-medroom-primaryLight`}>
                <Text className='text-medroom-secondary font-nunito-bold text-base'>
                  Saídas
                </Text>
          
                <Text className={`text-3xl font-nunito-bold text-red-600`}>
                    {dashboard?.stats.exitsToday ?? 0}
                </Text>
          
                <Text className='text-medroom-secondary text-sm font-nunito-bold'>
                  Já encerradas
                </Text>
              </View>
            </View>
          </View>

          <View className='gap-3'>
            <View className='flex-row items-center justify-between'>
              <Text className='text-medroom-secondary text-lg font-nunito-bold'>
                OCUPAÇÃO POR SALA
              </Text>
              
              { occupationPreview.length > 3 &&
                <Button.Default
                  label='Ver mais'
                  onTouch={() => router.push('/(authenticated)/(enterprise)/dashboard/occupationRooms')}
                  customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
                />
              }
            </View>

            { occupationPreview.length > 0 ? (
              occupationPreview.slice(0, 3).map(( item ) => (
                <Card.RoomOccupation
                  key={item.id}
                { ...item }
                />
              ))
            ) : (
              <ContentNotFound text='Nenhum sala encontrada!'/>
            )}
          </View>      
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Home