import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import Section from '@/components/ui/Section'
import { History } from '@/types/history.type'
import { Patient } from '@/types/patient.type'
import { useRouter } from 'expo-router'
import React from 'react'
import { FlatList, View } from 'react-native'

// Supondo que virá essas informações da API (Lista de apenas 3)
const ACTIVE_PATIENTS_DATA: Patient[] = [
  { id: 1, name: 'Maria Letícia Sampaio', nextSession: '2026-04-12T12:00:00.000Z', status: 'ACTIVE' },
  { id: 2, name: 'Cícero Antoniel do Fodase', nextSession: '2026-04-13T13:00:00.000Z', status: 'ACTIVE' },
  { id: 3, name: 'Eduardo Correia Fudido', nextSession: '2026-04-14T14:00:00.000Z', status: 'ACTIVE' },
];

// Supondo que virá essas informações da API (Lista de apenas 2)
const HISTORY: History[] = [
  { id: 4, lastSession: '2026-04-12T12:00:00.000Z' , patientName: 'Tiago Lima', status: 'CLOSED'},
  { id: 5, lastSession: '2026-04-12T12:00:00.000Z' , patientName: 'JONH CENAAH', status: 'CLOSED'},
];

const patients = () => {

  const router = useRouter();

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Meus pacientes'
      description='Clientes cadastrados'
      tab='PATIENTS'
      layoutType='PROFESSIONAL'    
      >
        <View className='flex-1 py-6 gap-5'>
          <Section 
          title='Ativos'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.replace('/(authenticated)/(professional)/patients/actives')}
              customStyle={{ container: 'py-[3px] px-4', text: 'text-[12.5px]' }}
            />
          )}
          >
            <FlatList
              data={ACTIVE_PATIENTS_DATA}
              contentContainerClassName='gap-4 py-1'
              renderItem={({ item, index }) => (
                <Card.Patient
                  { ...item }
                  from='ACTIVES'
                  gap={'gap-3'}
                  separationRow={(ACTIVE_PATIENTS_DATA.length - 1) !== index}
                />
              )}
            />
          </Section>

          <Section 
          title='Histórico'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.replace('/(authenticated)/(professional)/patients/history')}
              customStyle={{ container: 'py-[3px] px-4', text: 'text-[12.5px]' }}
            />
          )}
          >
            <FlatList
              data={HISTORY}
              contentContainerClassName='gap-4 py-1'
              renderItem={({ item, index }) => (
                <Card.Patient
                  { ...item }
                  from='HISTORY'
                  gap={'gap-3'}
                  separationRow={(HISTORY.length - 1) !== index}
                />
              )}
            />
          </Section>

          <Button.Default
            label='Cadastrar paciente'
            filled
            onTouch={() => {}}
          />
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default patients