import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import React from 'react'
import { Text } from 'react-native'

const patients = () => {
  return (
    <LayoutWrapper>
      <SystemLayout
      title='Meus pacientes'
      description='Clientes cadastrados'
      tab='PATIENTS'
      layoutType='PROFESSIONAL'    
      >
        <Text>
          Meus pacientes
        </Text>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default patients