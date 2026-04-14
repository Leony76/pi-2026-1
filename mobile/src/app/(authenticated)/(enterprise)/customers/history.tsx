import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { CustomerHistory } from '@/types/customer.type'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'

// Supondo que virá essas informações da API (Completa)
const HISTORY_CUSTOMERS_DATA: CustomerHistory[] = [
  { 
    id: 1,
    name: 'João Vitor Mendes Lacerda', 
    occupiedRoom: 'Sala 01',
    specialty: 'generalMedicine',
    unoccupiedRoomAt: '2026-04-12T00:00:00.000Z'
  },
  { 
    id: 2,
    name: 'Paulo Wendel Fonseca', 
    occupiedRoom: 'Sala 02',
    specialty: 'pediatrics',
    unoccupiedRoomAt: '2026-04-13T00:00:00.000Z'
  },
  { 
    id: 3,
    name: 'João Vitor Mendes Lacerda', 
    occupiedRoom: 'Sala 01',
    specialty: 'generalMedicine',
    unoccupiedRoomAt: '2026-04-12T00:00:00.000Z'
  },
  { 
    id: 4,
    name: 'Paulo Wendel Fonseca', 
    occupiedRoom: 'Sala 02',
    specialty: 'pediatrics',
    unoccupiedRoomAt: '2026-04-13T00:00:00.000Z'
  },
];

const History = (): React.JSX.Element => {

  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const filteredList = useMemo(() => 
    HISTORY_CUSTOMERS_DATA.filter((customer) => customer.name.toLowerCase().includes(searchValue?.toLowerCase() ?? '')), 
  [searchValue, HISTORY_CUSTOMERS_DATA]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Histórico de clientes'
      description='Listagem do histórico de clientes'
      tab='CUSTOMERS'
      goBack={() => router.back()}
      layoutType='ENTERPRISE'    
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
                <Card.Customer
                  key={item.id}
                  { ...item }
                  gap='gap-3'
                  separationRow={HISTORY_CUSTOMERS_DATA.length - 1 !== index}
                  from='HISTORY'
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
