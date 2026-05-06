import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import { Allocation } from '@/types/allocation.type'
import { useAuth } from '@/contexts/auth.context'
import { ApiError } from '@/services/api'
import { EnterpriseValuesResponse, fetchEnterpriseValuesWithAuth } from '@/services/rooms'
import { priceFormat } from '@/utils/priceFormat'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

const PricesByRoom = (): React.JSX.Element => {
  const router = useRouter();
  const auth = useAuth();
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [pricesRender, setPricesRender] = useState<Allocation>('DAILY');
  const [values, setValues] = useState<EnterpriseValuesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadValues() {
      if (!auth.token || !auth.refreshToken) {
        setError('Sessão inválida. Entre novamente para ver os valores.');
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
        setError(null);
        const response = await fetchEnterpriseValuesWithAuth(authenticated);
        setValues(response);
      } catch (requestError) {
        setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível carregar os preços por sala.');
      } finally {
        setIsLoading(false);
      }
    }

    loadValues();
  }, [auth]);

  const filteredList = useMemo(() => {
    const search = searchValue?.toLowerCase() ?? '';
    const roomPrices = values?.roomPrices ?? [];

    return roomPrices.filter((item) => item.room.toLowerCase().includes(search));
  }, [searchValue, values]);

  const allocationLabelMap: Record<Allocation, string> = {
    DAILY: 'Por dia',
    WEEK: 'Por semana',
    MONTH: 'Por mês',
  };

  if (isLoading) {
    return (
      <LayoutWrapper>
        <SystemLayout
          title='Preços por sala'
          description='Listagem dos preços por sala'
          tab='VALUES'
          goBack={() => router.back()}
          layoutType='ENTERPRISE'
        >
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color='#1AAFB4' />
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <SystemLayout
          title='Preços por sala'
          description='Listagem dos preços por sala'
          tab='VALUES'
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
        title='Preços por sala'
        description='Listagem dos preços por sala'
        tab='VALUES'
        goBack={() => router.back()}
        layoutType='ENTERPRISE'
      >
        <View className='flex-1 py-6 gap-5'>
          <View className='flex-row justify-between gap-3'>
            <Button.Default
              label='Por dia'
              filled={pricesRender === 'DAILY'}
              onTouch={() => setPricesRender('DAILY')}
              customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}
            />

            <Button.Default
              label='Por semana'
              filled={pricesRender === 'WEEK'}
              onTouch={() => setPricesRender('WEEK')}
              customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}
            />

            <Button.Default
              label='Mês'
              filled={pricesRender === 'MONTH'}
              onTouch={() => setPricesRender('MONTH')}
              customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}
            />
          </View>

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
              renderItem={({ item, index }) => {
                const allocationTypePriceMap: Record<Allocation, number | undefined> = {
                  DAILY: item.price.byHour,
                  WEEK: item.price._week,
                  MONTH: item.price.byMonth,
                };

                const allocationTypePrice = allocationTypePriceMap[pricesRender] ?? 0;

                return (
                  <Label___Value
                    separationRow={filteredList.length - 1 !== index}
                    key={item.id}
                    label={item.room}
                    value={{ _: `${allocationLabelMap[pricesRender]}: ${priceFormat(allocationTypePrice)}`, color: 'text-green-600' }}
                  />
                );
              }}
            />
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default PricesByRoom
