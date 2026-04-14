import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import ContentNotFound from '@/components/ui/ContentNotFound'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { Customer, CustomerHistory } from '@/types/customer.type'
import { EntryExitToday } from '@/types/entryExitToday.type'
import { formatDayMonthYear } from '@/utils/formatDayMonthYear'
import { formatHour } from '@/utils/formatHour'
import { useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

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
];

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
];

const ENTRY_EXIT_TODAY_DATA: EntryExitToday = {
  occupantName: 'Ana Lima',
  room: 'Sala 03',
  entry: '2026-04-15T08:00:00.000Z',
  exit: '2026-04-15T17:00:00.000Z',
  sessions: 6,
  totalValue: 'MONTHLY',
};

const Customers = (): React.JSX.Element => {

  const router = useRouter();

  const TOTAL_VALUE_MAP: Record<EntryExitToday['totalValue'], string> = {
    DAILY   : 'Diário',
    MONTHLY : 'Mensal',
    WEEKLY  : 'Semanal',
  };

  return (
    <LayoutWrapper>
      <SystemLayout 
      title='Clientes cadastrados' 
      description={'Profissionais e horários'} 
      layoutType={'ENTERPRISE'}      
      tab='CUSTOMERS'
      > 
        <ScrollView contentContainerClassName='py-6 gap-5'>
          <Section 
          title='Ativos agora'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.push('/(authenticated)/(enterprise)/customers/actives')}
              customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
            />
          )}
          >
            { ACTIVE_CUSTOMERS_DATA.length > 0 ? (
              ACTIVE_CUSTOMERS_DATA.map((item, index) => (
                <Card.Customer
                  key={item.id}
                  { ...item }
                  gap='gap-3'
                  separationRow={ACTIVE_CUSTOMERS_DATA.length - 1 !== index}
                  from='ACTIVES'
                />
              ))
            ) : (
              <ContentNotFound text='Nenhum cliente ativo'/>
            )}
          </Section>

          <Section 
          title='Histórico'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.push('/(authenticated)/(enterprise)/customers/history')}
              customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
            />
          )}
          >
            { HISTORY_CUSTOMERS_DATA.length > 0 ? (
              HISTORY_CUSTOMERS_DATA.map((item, index) => (
                <Card.Customer
                  key={item.id}
                  { ...item }
                  gap='gap-3'
                  separationRow={HISTORY_CUSTOMERS_DATA.length - 1 !== index}
                  from='HISTORY'
                />
              ))
            ) : (
              <ContentNotFound text='Nenhum histórico'/>
            )}
          </Section>

          <Section title='Entrada/saída hoje'>
            <View className='flex-row justify-between items-center'>
              <View>
                <Text className='font-nunito-bold text-medroom-primary text-xl'>
                  Dr(a). { ENTRY_EXIT_TODAY_DATA.occupantName } - { ENTRY_EXIT_TODAY_DATA.room }
                </Text>
              </View>
            </View>

            <View className='flex-row gap-2'>
              <Card.EntryAndExit
                hour={ formatHour(ENTRY_EXIT_TODAY_DATA.entry) }
                type='ENTRY'
                dayMonthYear={ formatDayMonthYear(ENTRY_EXIT_TODAY_DATA.entry) }
              />

              <Card.EntryAndExit
                hour={ formatHour(ENTRY_EXIT_TODAY_DATA.exit) }
                type='EXIT'
                dayMonthYear={ formatDayMonthYear(ENTRY_EXIT_TODAY_DATA.exit) }
              />         
            </View>

            <Label___Value
              label='Sessões realizadas'
              value={{ _: `${ ENTRY_EXIT_TODAY_DATA.sessions } sessões` }}
              separationRow
            />

            <Label___Value
              label='Valor total'
              value={{ _: TOTAL_VALUE_MAP[ENTRY_EXIT_TODAY_DATA.totalValue] }}
              boldLabel
            />
          </Section>  
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Customers