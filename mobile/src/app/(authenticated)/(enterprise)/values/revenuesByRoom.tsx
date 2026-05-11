import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { Modal } from '@/components/modal'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import Toast from '@/components/ui/Toast'
import { useAuth } from '@/contexts/auth.context'
import { ApiError } from '@/services/api'
import { EnterpriseValuesResponse, fetchEnterpriseValuesWithAuth } from '@/services/rooms'
import { priceFormat } from '@/utils/priceFormat'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'

const RevenuesByRoom = (): React.JSX.Element => {
  const router = useRouter();
  const auth = useAuth();
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomRevenueDetails, setRoomRevenueDetails] = useState<Pick<EnterpriseValuesResponse['roomRevenue']['roomsRevenue'][number], 'room' | 'revenue'> | null>(null);
  const [values, setValues] = useState<EnterpriseValuesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadValues() {
      if (!auth.token || !auth.refreshToken) {
        setErrorMessage('Sessão inválida. Entre novamente para ver os valores.');
        setIsLoading(false);
        return;
      }

      const authenticated = {
        token: auth.token,
        refreshToken: auth.refreshToken,
        updateTokens: auth.updateTokens,
        signOut: auth.signOut,
      };

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await fetchEnterpriseValuesWithAuth(authenticated);
        setValues(response);
      } catch (requestError) {
        setErrorMessage(requestError instanceof ApiError ? requestError.message : 'Não foi possível carregar as receitas por sala.');
      } finally {
        setIsLoading(false);
      }
    }

    loadValues();
  }, [auth]);

  const filteredList = useMemo(() => {
    const search = searchValue?.toLowerCase() ?? '';
    const roomsRevenue = values?.roomRevenue.roomsRevenue ?? [];

    return roomsRevenue.filter((item) => item.room.toLowerCase().includes(search));
  }, [searchValue, values]);

  if (isLoading) {
    return (
      <LayoutWrapper>
        <SystemLayout
          title='Receitas por sala'
          description='Listagem das receitas por sala'
          tab='VALUES'
          goBack={() => router.back()}
          layoutType='ENTERPRISE'
        >
          <View className='flex-1 items-center justify-center'>
            <ContentNotFound text='Carregando receitas por sala...'/>
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  if (errorMessage) {
    return (
      <LayoutWrapper>
        <Toast
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          visible={!!errorMessage}
        />

        <SystemLayout
          title='Receitas por sala'
          description='Listagem das receitas por sala'
          tab='VALUES'
          goBack={() => router.back()}
          layoutType='ENTERPRISE'
        >
          <View className='flex-1 items-center justify-center px-6'>
            <ContentNotFound text='Não foi possível carregar as receitas por sala'/>
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      {roomRevenueDetails && (
        <Modal.RoomRevenueDetails
          onRequestClose={() => setRoomRevenueDetails(null)}
          visible={!!roomRevenueDetails}
          roomData={roomRevenueDetails}
        />
      )}

      <SystemLayout
        title='Receitas por sala'
        description='Listagem das receitas por sala'
        tab='VALUES'
        goBack={() => router.back()}
        layoutType='ENTERPRISE'
      >
        <View className='flex-1 py-6 gap-5'>
          <Input.Search
            onChangeText={(text) => setSearchValue(text)}
            clear={() => setSearchValue(null)}
            value={searchValue ?? ''}
          />

          <View className='flex-1 gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col'>
            <FlatList
              data={filteredList}
              contentContainerClassName='gap-4 py-1'
              keyExtractor={(item, index) => `${item.id}-${index}`}
              ListEmptyComponent={<ContentNotFound text={`Nenhum resultado para "${searchValue ?? ''}"`} />}
              renderItem={({ item, index }) => (
                <Label___Value
                  separationRow={filteredList.length - 1 !== index}
                  key={item.id}
                  label={item.room}
                  value={{ _: priceFormat(item.totalRevenue), color: 'text-green-600' }}
                  onTouch={() => setRoomRevenueDetails({ room: item.room, revenue: item.revenue })}
                />
              )}
            />
          </View>

          <View className='gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col'>
            <Label___Value
              value={{
                _: priceFormat(values?.roomRevenue.totalRevenue ?? 0),
                color: 'text-green-600 text-lg'
              }}
              label='Receita total'
              boldLabel
            />
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default RevenuesByRoom
