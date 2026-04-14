import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import React from 'react'
import { Text, View } from 'react-native'

const Rooms = (): React.JSX.Element => {
  return (
    <LayoutWrapper>
      <SystemLayout 
      title='Gerenciar salas' 
      description={'Adicione e edite'} 
      layoutType={'ENTERPRISE'}      
      tab='ROOMS'
      > 
        <View className='flex-1 pt-6 gap-5'>
          <Text>
            Salas
          </Text>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Rooms