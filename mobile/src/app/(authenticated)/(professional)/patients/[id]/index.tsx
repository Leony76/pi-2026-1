import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import AvailbilityTag from '@/components/ui/AvailbilityTag'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { useAuth } from '@/contexts/auth.context'
import { PatientService } from '@/services/patients'
import { AuthHandlers } from '@/types/auth/authHandlers.type'
import { PatientInfos } from '@/types/patient/patient.type'
import { formatDate } from '@/utils/formatDate'
import { formatHour } from '@/utils/formatHour'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'

const PatientDetails = (): React.JSX.Element => {

  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [ patient, setPatient ] = useState<PatientInfos | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const nameArray = patient?.name.trim().split(' ') || [];

  const displayName = nameArray.length > 1 
    ? `${nameArray[0]} ${nameArray[1]}` 
    : nameArray[0]
  ;

  const getPatientById = async(patientId: string): Promise<void> => {
    try {
      if (!token || !refreshToken) {
        setError('Não autenticado');
        return;
      }

      const authHandlers: AuthHandlers = {
        token,
        refreshToken,
        updateTokens,
        signOut,
      };

      const response = await PatientService.fetchPatientById(
        patientId, 
        authHandlers
      );

      setPatient(response);
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

    const loadPatient = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      await getPatientById(patientId);
      setIsLoading(false);
    };

    loadPatient();
  }, [id, token, refreshToken, updateTokens, signOut]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title={displayName ?? '[ Nome não provido ]'}
      description={displayName ? 'Paciente ativo(a)' : 'Paciente inexistente'}
      tab='PATIENTS'
      layoutType='PROFESSIONAL'    
      goBack={() => router.push('/(authenticated)/(professional)/patients/actives')}
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
          <Section title='Informações'>
            <Label___Value
              label='Nome'
              value={{ _: patient?.name ?? '[ Nome não provido ]'}}
              separationRow
            />

            <Label___Value
              label='Telefone'
              value={{ _: patient?.phone ?? '[ Telefone não provido ]'}}
              separationRow
            />

            <Label___Value
              label='Desde'
              value={{ _: formatDate(patient?.createdAt ?? '') ?? '[ Data de criação não provida ]'}}
              separationRow
            />

            <Label___Value
              label='Status'
              value={{ Component: () => (
                <AvailbilityTag
                  isAvailable={patient?.status === 'ACTIVE' ? true : false}
                  tagType='ACTIVITY'               
                />
              )}}
            />
          </Section>

          <Section title='Próxima sessão'>
            <View className="gap-3">
              {patient?.sessions && patient.sessions.length > 0 ? (
                patient.sessions.slice(0, 2).map((item, index) => (
                  <Label___Value
                    key={`${item.date}-${index}`}
                    boldLabel
                    gap='gap-3'
                    separationRow={index === 0 && patient.sessions.length > 1}
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
                ))
              ) : (
                <ContentNotFound text='Nenhuma sessão encontrada'/>
              )}
            </View>
          </Section>      
        </ScrollView>
        )}
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default PatientDetails

// Cortado //

{/* <Section title='Histórico de sessões'>
  <Label___Value
    label='Total realizadas'
    value={{ _: String(patient?.sessionHistory?.totalMade ?? 0) }}
    separationRow
  />

  <Label___Value
    label='Última sessão'
    value={{ _: patient?.sessionHistory?.session?.lastOneDate ? formatDate(patient.sessionHistory.session.lastOneDate) : '-' }}
    separationRow
  />

  <Label___Value
    label='Valor por sessão'
    value={{ 
      _: priceFormat(patient?.sessionHistory?.session?.valueByEach ?? 0),
      color: 'text-green-600',
    }}
    separationRow
  />

  <Label___Value
    label='Total gerado'
    value={{ 
      _: priceFormat(patient?.sessionHistory?.session?.totalGenerated ?? 0),
      color: 'text-green-600',
    }}
  />
</Section> */}