import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { ApiError } from '@/services/api'
import { EnterpriseService} from '@/services/enterprise'
import { formatDayMonthYear } from '@/utils/formatDayMonthYear'
import { formatHour } from '@/utils/formatHour'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useAuth } from '@/contexts/auth.context'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { EnterpriseDashboardResponse } from '@/types/metrics/enterpriseDashboardResponse.type'
import { AuthHandlers } from '@/types/auth/authHandlers.type'

const Customers = (): React.JSX.Element => {

  const router = useRouter();
  const auth = useAuth();
  const [dashboard, setDashboard] = useState<EnterpriseDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!auth.token || !auth.refreshToken) {
        setError('Sessão inválida. Entre novamente para ver os clientes.');
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
        setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível carregar os clientes.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [auth]);

  const activeCustomers = dashboard?.activeCustomers ?? [];
  const historyCustomers = dashboard?.historyCustomers ?? [];
  const entryExitToday = dashboard?.entryExitToday ?? null;

  const TOTAL_VALUE_MAP: Record<'MONTHLY' | 'DAILY' | 'WEEKLY', string> = {
    DAILY   : 'Diário',
    MONTHLY : 'Mensal',
    WEEKLY  : 'Semanal',
  };

  if (isLoading) {
    return (
      <LayoutWrapper>
        <SystemLayout 
        title='Clientes cadastrados' 
        description={'Profissionais e horários'} 
        layoutType={'ENTERPRISE'}      
        tab='CUSTOMERS'
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
        title='Clientes cadastrados' 
        description={'Profissionais da saúde cads'} 
        layoutType={'ENTERPRISE'}      
        tab='CUSTOMERS'
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
      title='Clientes cadastrados' 
      description={'Profissionais e horários'} 
      layoutType={'ENTERPRISE'}      
      tab='CUSTOMERS'
      > 
        <ScrollView contentContainerClassName='py-6 gap-5'>
          <Section 
          title='Ativos agora'
          {...(activeCustomers.length > 3) && {
            SideComponent: () => (
              <Button.Default
                label='Ver mais'
                onTouch={() => router.push('/(authenticated)/(enterprise)/customers/actives')}
                customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
              />
            )
          }}
          >
            { activeCustomers.length > 0 ? (
              activeCustomers.slice(0, 3).map((item, index) => (
                <Card.Customer
                  key={item.id}
                  { ...item }
                  gap='gap-3'
                  separationRow={activeCustomers.slice(0, 3).length - 1 !== index}
                  from='ACTIVES'
                />
              ))
            ) : (
              <ContentNotFound text='Nenhum cliente ativo'/>
            )}
          </Section>

          <Section 
          title='Histórico'
          {...(historyCustomers.length > 3 && {
            SideComponent: () => (
              <Button.Default
                label='Ver mais'
                onTouch={() => router.push('/(authenticated)/(enterprise)/customers/history')}
                customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
              />
            )
          })}
          >
            { historyCustomers.length > 0 ? (
              historyCustomers.slice(0, 3).map((item, index) => (
                <Card.Customer
                  key={item.id}
                  { ...item }
                  gap='gap-3'
                  separationRow={historyCustomers.slice(0, 3).length - 1 !== index}
                  from='HISTORY'
                />
              ))
            ) : (
              <ContentNotFound text='Nenhum histórico'/>
            )}
          </Section>

          <Section title='Entrada/saída hoje'>
            { entryExitToday ? (
              <>
                <View className='flex-row justify-between items-center'>
                  <View>
                    <Text className='font-nunito-bold text-medroom-primary text-xl'>
                      Dr(a). { entryExitToday.occupantName } - { entryExitToday.room }
                    </Text>
                  </View>
                </View>

                <View className='flex-row gap-2'>
                  <Card.EntryAndExit
                    hour={ formatHour(entryExitToday.entry) }
                    type='ENTRY'
                    dayMonthYear={ formatDayMonthYear(entryExitToday.entry) }
                  />

                  <Card.EntryAndExit
                    hour={ formatHour(entryExitToday.exit) }
                    type='EXIT'
                    dayMonthYear={ formatDayMonthYear(entryExitToday.exit) }
                  />         
                </View>

                <Label___Value
                  label='Sessões realizadas'
                  value={{ _: `${ entryExitToday.sessions } sessões` }}
                  separationRow
                />

                <Label___Value
                  label='Valor total'
                  value={{ _: TOTAL_VALUE_MAP[entryExitToday.totalValue] }}
                  boldLabel
                />
              </>
            ) : (
              <ContentNotFound text='Nenhuma movimentação encontrada hoje'/>
            )}
          </Section>  
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Customers