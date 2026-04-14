import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import { Customer } from '@/types/customer.type'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'

// Supondo que virá essas informações da API (Completa)
const ACTIVE_CUSTOMERS_DATA: Customer[] = [
  { 
    id: 1,
    name: 'João Marcelio de Melo', 
    occupation: {
      startHour : '08:00',
      endHour   : '17:00',
      limitDate : '2026-04-20T00:00:00.000Z'
    },
    occupiedRoom: 'Sala 01',
    specialty: 'generalMedicine',
  },
  { 
    id: 2,
    name: 'Henrque Sampáio George', 
    occupation: {
      startHour : '10:00',
      endHour   : '12:00',
      limitDate : '2026-04-15T00:00:00.000Z'
    },
    occupiedRoom: 'Sala 02',
    specialty: 'pediatrics',
  },
  { 
    id: 3,
    name: 'João Marcelio de Melo', 
    occupation: {
      startHour : '08:00',
      endHour   : '17:00',
      limitDate : '2026-04-20T00:00:00.000Z'
    },
    occupiedRoom: 'Sala 01',
    specialty: 'generalMedicine',
  },
  { 
    id: 4,
    name: 'Henrque Sampáio George', 
    occupation: {
      startHour : '10:00',
      endHour   : '12:00',
      limitDate : '2026-04-15T00:00:00.000Z'
    },
    occupiedRoom: 'Sala 02',
    specialty: 'pediatrics',
  },
  { 
    id: 5,
    name: 'João Marcelio de Melo', 
    occupation: {
      startHour : '08:00',
      endHour   : '17:00',
      limitDate : '2026-04-20T00:00:00.000Z'
    },
    occupiedRoom: 'Sala 01',
    specialty: 'generalMedicine',
  },
  { 
    id: 6,
    name: 'Henrque Sampáio George', 
    occupation: {
      startHour : '10:00',
      endHour   : '12:00',
      limitDate : '2026-04-15T00:00:00.000Z'
    },
    occupiedRoom: 'Sala 02',
    specialty: 'pediatrics',
  },
  { 
    id: 7,
    name: 'João Marcelio de Melo', 
    occupation: {
      startHour : '08:00',
      endHour   : '17:00',
      limitDate : '2026-04-20T00:00:00.000Z'
    },
    occupiedRoom: 'Sala 01',
    specialty: 'generalMedicine',
  },
  { 
    id: 8,
    name: 'Henrque Sampáio George', 
    occupation: {
      startHour : '10:00',
      endHour   : '12:00',
      limitDate : '2026-04-15T00:00:00.000Z'
    },
    occupiedRoom: 'Sala 02',
    specialty: 'pediatrics',
  },
];

const Actives = (): React.JSX.Element => {

  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const filteredList = useMemo(() => 
    ACTIVE_CUSTOMERS_DATA.filter((customer) => customer.name.toLowerCase().includes(searchValue?.toLowerCase() ?? '')), 
  [searchValue, ACTIVE_CUSTOMERS_DATA]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Clientes ativos'
      description='Listagem dos clientes ativos'
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
                  separationRow={ACTIVE_CUSTOMERS_DATA.length - 1 !== index}
                  from='ACTIVES'
                />
              )}
            />
          </View>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Actives