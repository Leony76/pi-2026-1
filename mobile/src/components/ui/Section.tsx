import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  title    : string;
  children : React.ReactNode;
  row?     : boolean;
};

const Section = (props:Props) => {
  return (
    <View className='gap-4'>
      <Text className='text-medroom-secondary text-lg font-nunito-bold'>
        { props.title.toUpperCase() }
      </Text>

      <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 ${props.row ? 'flex-row' : 'flex-col'}`}>
        { props.children }
      </View>
    </View>
  )
}

export default Section