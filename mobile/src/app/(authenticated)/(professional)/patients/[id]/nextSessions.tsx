import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import { PatientInfos } from '@/types/patient.type'
import { formatDate } from '@/utils/formatDate'
import { formatHour } from '@/utils/formatHour'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'

// Supondo que essas serão as informações dos paciente no banco, e que será buscado
// no back a partir do id provida na url, trazendo somente o paciente selecionado
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

const NextSessions = (): React.JSX.Element => {

  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [ sessions, setSession ] = useState<PatientInfos['sessions'] | null>(null);

  const { id } = useLocalSearchParams();

  const getPatientSessionsByHisId = async(id: number): Promise<void> => {
    try {
      const response: (PatientInfos | undefined) = PATIENTS_GENERAL_INFOS_DATA.find((patient) => patient.id === Number(id));

      if (response) setSession(response.sessions);
    } catch (error:unknown) {
      if (error instanceof Error) {
        console.error('Houver um erro ao carregar as informações do paciente: ' + error.message);
      }
    }
  };

  useEffect(() => {
    getPatientSessionsByHisId(Number(id));
  }, []);

  const filteredPatientNextSessions = sessions?.filter((session) => 
    session.room.toLocaleLowerCase().includes(searchValue?.toLocaleLowerCase() ?? '')
  );

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Próximas sessões'
      description='Listagem das próximas sessões do paciente'
      tab='PATIENTS'
      goBack={() => router.back()}
      layoutType='PROFESSIONAL'    
      >
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
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default NextSessions