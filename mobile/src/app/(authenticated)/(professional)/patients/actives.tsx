import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { Patient } from '@/types/patient.type'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'

// Supondo que virá essas informações da API (Completa)
const ACTIVE_PATIENTS_DATA: Patient[] = [
  { id: 1, name: 'Maria Costa', nextSession: '2026-04-12T12:00:00.000Z', status: 'ACTIVE' },
  { id: 2, name: 'Roberto Pinto', nextSession: '2026-04-13T13:00:00.000Z', status: 'ACTIVE' },
  { id: 3, name: 'Fernanda Souza', nextSession: '2026-04-14T14:00:00.000Z', status: 'ACTIVE' },
  { id: 4, name: 'Maria Costa', nextSession: '2026-04-12T12:00:00.000Z', status: 'ACTIVE' },
  { id: 5, name: 'Roberto Pinto', nextSession: '2026-04-13T13:00:00.000Z', status: 'ACTIVE' },
  { id: 6, name: 'Fernanda Souza', nextSession: '2026-04-14T14:00:00.000Z', status: 'ACTIVE' },
  { id: 7, name: 'Maria Costa', nextSession: '2026-04-12T12:00:00.000Z', status: 'ACTIVE' },
  { id: 8, name: 'Roberto Pinto', nextSession: '2026-04-13T13:00:00.000Z', status: 'ACTIVE' },
  { id: 9, name: 'Fernanda Souza', nextSession: '2026-04-14T14:00:00.000Z', status: 'ACTIVE' },
];

const ActivePatients = (): React.JSX.Element => {

  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const filteredList = useMemo(() => 
    ACTIVE_PATIENTS_DATA.filter((patient) => patient.name.toLowerCase().includes(searchValue?.toLowerCase() ?? '')), 
  [searchValue, ACTIVE_PATIENTS_DATA]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Pascientes ativos'
      description='Listagem dos pacientes ativos'
      tab='PATIENTS'
      goBack={() => router.replace('/(authenticated)/(professional)/patients')}
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
                  separationRow={(ACTIVE_PATIENTS_DATA.length - 1) !== index}
                />
              )}
            />
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default ActivePatients