import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import React from 'react'
import { Text } from 'react-native'

const profile = () => {
  return (
    <LayoutWrapper>
      <SystemLayout
      title='Perfil'
      description='Personalize e altere suas informações'
      tab='PROFILE'
      layoutType='PROFESSIONAL'    
      >
        <Text>
          Perfil
        </Text>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default profile