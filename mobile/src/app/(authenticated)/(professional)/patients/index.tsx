import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import Section from '@/components/ui/Section'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Toast from '@/components/ui/Toast'
import { useAuth } from '@/contexts/auth.context'
import { fetchActivePatientsWithAuth, fetchPatientHistoryWithAuth } from '@/services/patients'
import { History } from '@/types/history.type'
import { Patient } from '@/types/patient.type'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'

const Patients = (): React.JSX.Element => {

  const router = useRouter();
  const params = useLocalSearchParams();
  const { token, refreshToken, updateTokens, signOut } = useAuth();

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [activePatients, setActivePatients] = useState<Patient[]>([]);
  const [historyPatients, setHistoryPatients] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.message) {
      setToastVisible(true);
    }
  }, [params.message]);

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

        const [active, history] = await Promise.all([
          fetchActivePatientsWithAuth({ token, refreshToken, updateTokens, signOut }, 3),
          fetchPatientHistoryWithAuth({ token, refreshToken, updateTokens, signOut }, 2),
        ]);

        setActivePatients(active);
        setHistoryPatients(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes');
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, [token, refreshToken, updateTokens, signOut]);

  const handleCloseToast = () => {
    setToastVisible(false);
    router.setParams({ message: '' });
  };

  return (
    <LayoutWrapper>
      <Toast
        message={params.message as string}
        onClose={handleCloseToast}
        visible={toastVisible}
      />

      <SystemLayout
      title='Meus pacientes'
      description='Clientes cadastrados'
      tab='PATIENTS'
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
        <ScrollView contentContainerClassName='py-6 gap-5'>
          <Section 
          title='Ativos'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.push('/(authenticated)/(professional)/patients/actives')}
              customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
            />
          )}
          >
            <View className="gap-4 py-1">
              {activePatients.length > 0 ? (
                activePatients.map((item, index) => (
                  <Card.Patient
                    key={item.id}
                    {...item}
                    from='ACTIVES'
                    gap={'gap-3'}
                    separationRow={(activePatients.length - 1) !== index}
                  />
                ))
              ) : (
                <ContentNotFound text='Você ainda não possui pacientes ativos.' />
              )}
            </View>
          </Section>

          <Section 
          title='Histórico'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.push('/(authenticated)/(professional)/patients/history')}
              customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
            />
          )}
          >
            <View className="gap-4 py-1">
              {historyPatients.length > 0 ? (
                historyPatients.map((item, index) => (
                  <Card.Patient
                    key={item.id}
                    {...item}
                    from='HISTORY'
                    gap={'gap-3'}
                    separationRow={(historyPatients.length - 1) !== index}
                  />
                ))
              ) : (
                <ContentNotFound text='Ainda não há clientes no seu histórico.' />
              )}
            </View>
          </Section>

          <Button.Default
            label='Cadastrar paciente'
            filled
            icon={{ name: 'new_person' }}
            onTouch={() => router.push('/(authenticated)/(professional)/patients/newPatient')}
          />
        </ScrollView>
        )}
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Patients