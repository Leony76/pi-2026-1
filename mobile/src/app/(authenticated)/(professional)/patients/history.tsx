import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'
import { History as HistoryType } from '@/types/history.type'

// Supondo que virá essas informações da API (Completa)
const HISTORY: HistoryType[] = [
  { id: 1,lastSession: '2026-04-12T12:00:00.000Z' , patientName: 'Tiago Lima', status: 'CLOSED'},
  { id: 2,lastSession: '2026-04-12T12:00:00.000Z' , patientName: 'JONH CENAAH', status: 'CLOSED'},
];

const History = (): React.JSX.Element => {

  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const filteredList = useMemo(() => 
    HISTORY.filter((patient) => patient.patientName.toLowerCase().includes(searchValue?.toLowerCase() ?? '')), 
  [searchValue, HISTORY]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Histórico'
      description='Histórico das consultas'
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
                  from='HISTORY'
                  gap={'gap-3'}
                  separationRow={(HISTORY.length - 1) !== index}
                />
              )}
            />
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default History