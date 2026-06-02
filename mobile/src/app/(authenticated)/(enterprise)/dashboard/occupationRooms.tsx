import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useAuth } from '@/contexts/auth.context'
import { ApiError } from '@/services/api'
import { EnterpriseService } from '@/services/enterprise'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { EnterpriseDashboardResponse } from '@/types/metrics/enterpriseDashboardResponse.type'
import { AuthHandlers } from '@/types/auth/authHandlers.type'

const OccupationRooms = (): React.JSX.Element => {

  const router = useRouter();
  const auth = useAuth();
  const [searchValue, setSearchValue] = useState<string | null>(null);
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
        setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível carregar a ocupação das salas.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [auth]);

  const filteredList = useMemo(() => {
    const search = searchValue?.toLowerCase() ?? '';
    const rooms = dashboard?.roomOccupation ?? [];

    return rooms.filter((room) => {
      const titleMatch = room.title.toLowerCase().includes(search);
      const occupantMatch = room.occupant?.toLowerCase().includes(search);

      return titleMatch || occupantMatch;
    });
  }, [searchValue, dashboard]);

  if (isLoading) {
    return (
      <LayoutWrapper>
        <SystemLayout
        title='Ocupação por sala'
        description='Listagem das ocupações por sala'
        tab='DASHBOARD'
        goBack={() => router.back()}
        layoutType='ENTERPRISE'    
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
        title='Ocupação por sala'
        description='Listagem das ocupações por sala'
        tab='DASHBOARD'
        goBack={() => router.back()}
        layoutType='ENTERPRISE'    
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
      title='Ocupação por sala'
      description='Listagem das ocupações por sala'
      tab='DASHBOARD'
      goBack={() => router.back()}
      layoutType='ENTERPRISE'    
      >
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
              ListEmptyComponent={ <ContentNotFound text={`Nenhum resultado para "${ searchValue }"`}/> }
              renderItem={({ item }) => (
                <Card.RoomOccupation
                  key={item.id}
                  { ...item }
                />
              )}
            />
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default OccupationRooms;