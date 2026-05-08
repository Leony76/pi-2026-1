import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import { useAuth } from '@/contexts/auth.context'
import { fetchPatientByIdWithAuth } from '@/services/patients'
import { PatientInfos } from '@/types/patient.type'
import { formatDate } from '@/utils/formatDate'
import { formatHour } from '@/utils/formatHour'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

const NextSessions = (): React.JSX.Element => {

  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [ sessions, setSession ] = useState<PatientInfos['sessions'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useLocalSearchParams();

  const getPatientSessionsByHisId = async(patientId: string): Promise<void> => {
    try {
      if (!token || !refreshToken) {
        setError('Não autenticado');
        return;
      }

      const response = await fetchPatientByIdWithAuth(patientId, {
        token,
        refreshToken,
        updateTokens,
        signOut,
      });

      if (response) setSession(response.sessions);
    } catch (error:unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    const patientId = typeof id === 'string' ? id : '';

    if (!patientId) {
      setError('Paciente não identificado');
      setIsLoading(false);
      return;
    }

    const loadSessions = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      await getPatientSessionsByHisId(patientId);
      setIsLoading(false);
    };

    loadSessions();
  }, [id, token, refreshToken, updateTokens, signOut]);

  const filteredPatientNextSessions = sessions?.filter((session) => 
    session.room.toLocaleLowerCase().includes(searchValue?.toLocaleLowerCase() ?? '')
  );

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Próximas sessões'
      description='Listagem das próximas sessões do paciente'
      tab='PATIENTS'
      goBack={() => router.push(`/(authenticated)/(professional)/patients/${id}`)}
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
              keyExtractor={(item, index) => `${item.date}-${index}`}
              data={filteredPatientNextSessions}
              contentContainerClassName='gap-3'
              ListEmptyComponent={ <ContentNotFound text='Nenhuma sessão encontrada'/> }
              renderItem={({ item, index }) => (
                <Label___Value
                  boldLabel
                  gap='gap-3'
                  separationRow={(filteredPatientNextSessions?.length! - 1) !== index}
                  label={formatDate(item.date)}
                  value={{ Component: () => (
                    <View className='items-end'> 
                      <Text className="text-medroom-primary font-nunito-bold">
                        {formatHour(item.hour.start)} às {formatHour(item.hour.end)}
                      </Text>

                      <Text className="text-medroom-secondary font-nunito text-right">
                        {item.room}
                      </Text>
                    </View>
                  )}}
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

export default NextSessions