import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { useAuth } from '@/contexts/auth.context'
import { fetchActivePatientsWithAuth } from '@/services/patients'
import { Patient } from '@/types/patient.type'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

const ActivePatients = (): React.JSX.Element => {

  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [activePatients, setActivePatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatients = async (): Promise<void> => {
      if (!token || !refreshToken) {
        setError('Não autenticado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchActivePatientsWithAuth({ token, refreshToken, updateTokens, signOut });
        setActivePatients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes ativos');
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, [token, refreshToken, updateTokens, signOut]);

  const filteredList = useMemo(() => 
    activePatients.filter((patient) => patient.name.toLowerCase().includes(searchValue?.toLowerCase() ?? '')), 
  [searchValue, activePatients]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Pascientes ativos'
      description='Listagem dos pacientes ativos'
      tab='PATIENTS'
      goBack={() => router.replace('/(authenticated)/(professional)/patients')}
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
              ListEmptyComponent={ <ContentNotFound text={`Nenhum resultado para "${ searchValue }"`}/> }
              renderItem={({ item, index }) => (
                <Card.Patient
                  key={item.id}
                  { ...item }
                  from='ACTIVES'
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

export default ActivePatients