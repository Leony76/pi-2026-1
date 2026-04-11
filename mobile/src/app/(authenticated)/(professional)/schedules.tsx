import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import React from 'react'
import { Text } from 'react-native'

const schedules = () => {
  return (
    <LayoutWrapper>
      <SystemLayout
      title='Meus horários'
      description='Entradas, saídas, sessões'
      tab='SCHEDULES'
      layoutType='PROFESSIONAL'    
      >
        <Text>
          Meus horários
        </Text>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default schedules