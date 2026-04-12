import { Button } from '@/components/button'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import AvailbilityTag from '@/components/ui/AvailbilityTag'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { PatientInfos } from '@/types/patient.type'
import { formatDate } from '@/utils/formatDate'
import { formatHour } from '@/utils/formatHour'
import { priceFormat } from '@/utils/priceFormat'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, ScrollView, Text, View } from 'react-native'

// Supondo que essas serão as informações dos paciente no banco, e que será buscado
// no back a partir do id provida na url, trazendo somente o pacinete selecionado
const PATIENTS_GENERAL_INFOS_DATA: PatientInfos[] = [
  {
    id: 1,
    name: 'Maria Letícia Sampaio',
    phone: '(88) 92321-2393',
    status: 'ACTIVE',
    createdAt: '2011-10-05T14:48:00.000Z',
    sessionHistory: {
      totalMade: 12,
      session: {
        lastOneDate    : '2026-03-05T14:00:00.000Z',
        totalGenerated : 66420.9,
        valueByEach    : 233.3,
      },
    },
    sessions: [
      { 
        date: '2026-03-05T14:00:00.000Z', 
        hour: {
          start : '2026-03-05T14:00:00.000Z',
          end   : '2026-03-05T15:00:00.000Z',
        },
        room: 'Sala 01'
      },
      { 
        date: '2026-03-05T14:00:00.000Z', 
        hour: {
          start : '2026-03-05T14:00:00.000Z',
          end   : '2026-03-05T15:00:00.000Z',
        },
        room: 'Sala 01'
      },
    ],
  },
  {
    id: 2,
    name: 'Cícero Antoniel do Fodase',
    phone: '(88) 92321-2393',
    status: 'ACTIVE',
    createdAt: '2011-10-05T14:48:00.000Z',
    sessionHistory: {
      totalMade: 12,
      session: {
        lastOneDate    : '2026-03-05T14:00:00.000Z',
        totalGenerated : 66420.9,
        valueByEach    : 233.3,
      },
    },
    sessions: [
      { 
        date: '2026-03-05T14:00:00.000Z', 
        hour: {
          start : '2026-03-05T14:00:00.000Z',
          end   : '2026-03-05T15:00:00.000Z',
        },
        room: 'Sala 01'
      },
      { 
        date: '2026-03-05T14:00:00.000Z', 
        hour: {
          start : '2026-03-05T14:00:00.000Z',
          end   : '2026-03-05T15:00:00.000Z',
        },
        room: 'Sala 01'
      },
    ],
  },
  {
    id: 3,
    name: 'Eduardo Correia Fudido',
    phone: '(88) 92321-2393',
    status: 'ACTIVE',
    createdAt: '2011-10-05T14:48:00.000Z',
    sessionHistory: {
      totalMade: 12,
      session: {
        lastOneDate    : '2026-03-05T14:00:00.000Z',
        totalGenerated : 66420.9,
        valueByEach    : 233.3,
      },
    },
    sessions: [
      { 
        date: '2026-03-05T14:00:00.000Z', 
        hour: {
          start : '2026-03-05T14:00:00.000Z',
          end   : '2026-03-05T15:00:00.000Z',
        },
        room: 'Sala 01'
      }
    ],
  },
];

const PatientDetails = (): React.JSX.Element => {

  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [ patient, setPatient ] = useState<PatientInfos | null>(null);

  const nameArray = patient?.name.trim().split(' ') || [];

  const displayName = nameArray.length > 1 
    ? `${nameArray[0]} ${nameArray[1]}` 
    : nameArray[0]
  ;

  const handleGetPatientById = async(id: number): Promise<void> => {
    try {
      // Simulando um requisão GET da API pelo ID do paciente
      const response: (PatientInfos | undefined) = PATIENTS_GENERAL_INFOS_DATA.find((patient) => patient.id === Number(id));

      if (response) setPatient(response);
    } catch (error:unknown) {
      if (error instanceof Error) {
        console.error('Houver um erro ao carregar as informações do paciente: ' + error.message);
      }
    }
  };

  useEffect(() => {
    handleGetPatientById(Number(id));
  }, []);

  return (
    <LayoutWrapper>
      <SystemLayout
      title={displayName ?? '[ Nome não provido ]'}
      description={displayName ? 'Pasciente ativo(a)' : 'Pasciente inexistente'}
      tab='PATIENTS'
      layoutType='PROFESSIONAL'    
      goBack={() => router.back()}
      >
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

          <Section 
          title='Próximas sessões'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.replace('/(authenticated)/(professional)/patients/history')}
              customStyle={{ container: 'py-[3px] px-4', text: 'text-[12.5px]' }}
            />
          )}
          >
            <FlatList
              data={patient?.sessions}
              contentContainerClassName='gap-3'
              ListEmptyComponent={ <ContentNotFound text='Nenhuma sessão encontrada'/> }
              renderItem={({ item, index }) => (
                <Label___Value
                  boldLabel
                  gap='gap-3'
                  separationRow={(patient?.sessions.length! - 1) !== index}
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
          </Section>

          <Section title='Histórico de sessões'>
            <Label___Value
              label='Total realizadas'
              value={{ _: String(patient?.sessionHistory.totalMade) ?? '[ Número não provido ]' }}
              separationRow
            />

            <Label___Value
              label='Última sessão'
              value={{ _: formatDate(patient?.sessionHistory.session.lastOneDate ?? '') ?? '[ Data não provida ]' }}
              separationRow
            />

            <Label___Value
              label='Valor por sessão'
              value={{ 
                _: priceFormat(patient?.sessionHistory.session.valueByEach ?? 0) ?? '[ Valor não provido ]' ,
                color: 'text-green-600',
              }}
              separationRow
            />

            <Label___Value
              label='Total gerado'
              value={{ 
                _: priceFormat(patient?.sessionHistory.session.totalGenerated ?? 0) ?? '[ Valor não provido ]' ,
                color: 'text-green-600',
              }}
            />
          </Section>
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default PatientDetails