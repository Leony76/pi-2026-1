import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import React from 'react'
import { Text, View } from 'react-native'

const Values = (): React.JSX.Element => {
  return (
    <LayoutWrapper>
      <SystemLayout 
      title='Valores' 
      description={'Receitas e despesas'} 
      layoutType={'ENTERPRISE'}      
      tab='VALUES'
      > 
        <View className='flex-1 pt-6 gap-5'>
          <Text>
            Valores
          </Text>
        </View>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Values