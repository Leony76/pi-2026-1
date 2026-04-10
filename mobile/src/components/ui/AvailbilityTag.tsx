import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  isAvailable : boolean;
  aboslute?   : string;
};

const AvailbilityTag = (props:Props) => {
  return (
    <View className={`py-1 px-6 rounded-lg border ${props.isAvailable ? 'border-green-400 bg-green-100' : 'border-red-400 bg-red-100'} ${props.aboslute ?? ''}`}>
      <Text className={props.isAvailable ? 'text-green-600' : 'text-red-600'}>
        { props.isAvailable ? 'Disponível' : 'Indisponível' }
      </Text>
    </View>
  )
}

export default AvailbilityTag