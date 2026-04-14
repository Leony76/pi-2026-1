import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import React from 'react'
import { Text, View } from 'react-native'

const Customers = (): React.JSX.Element => {
  return (
    <LayoutWrapper>
      <SystemLayout 
      title='Clientes cadastrados' 
      description={'Profissionais e horários'} 
      layoutType={'ENTERPRISE'}      
      tab='CUSTOMERS'
      > 
        <View className='flex-1 pt-6 gap-5'>
          <Text>
            Clientes
          </Text>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Customers