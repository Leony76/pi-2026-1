import { Button } from '@/components/button'
import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import Section from '@/components/ui/Section'
import Toast from '@/components/ui/Toast'
import { History } from '@/types/history.type'
import { Patient } from '@/types/patient.type'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'

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

const Patients = (): React.JSX.Element => {

  const router = useRouter();
  const params = useLocalSearchParams();

  const [toastVisible, setToastVisible] = useState<boolean>(false);

  useEffect(() => {
    if (params.message) {
      setToastVisible(true);
    }
  }, [params.message]);

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
        <ScrollView contentContainerClassName='py-6 gap-5'>
          <Section 
          title='Ativos'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.replace('/(authenticated)/(professional)/patients/actives')}
              customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
            />
          )}
          >
            <View className="gap-4 py-1">
              {ACTIVE_PATIENTS_DATA.map((item, index) => (
                <Card.Patient
                  key={item.id}
                  {...item}
                  from='ACTIVES'
                  gap={'gap-3'}
                  separationRow={(ACTIVE_PATIENTS_DATA.length - 1) !== index}
                />
              ))}
            </View>
          </Section>

          <Section 
          title='Histórico'
          SideComponent={() => (
            <Button.Default
              label='Ver mais'
              onTouch={() => router.replace('/(authenticated)/(professional)/patients/history')}
              customStyle={{ container: 'py-[6px] px-4', text: 'text-sm' }}
            />
          )}
          >
            <View className="gap-4 py-1">
              {HISTORY.map((item, index) => (
                <Card.Patient
                  key={item.id}
                  {...item}
                  from='HISTORY'
                  gap={'gap-3'}
                  separationRow={(HISTORY.length - 1) !== index}
                />
              ))}
            </View>
          </Section>

          <Button.Default
            label='Cadastrar paciente'
            filled
            icon={{ name: 'new_person' }}
            onTouch={() => router.push('/(authenticated)/(professional)/patients/newPatient')}
          />
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Patients