import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  title    : string;
  children : React.ReactNode;
  row?     : boolean;
  flex1?   : boolean;
  SideComponent?: React.ElementType;
};

const Section = (props:Props) => {

  const Component = props.SideComponent;

  return (
    <View className={`gap-4 ${props.flex1 ? 'flex-1' : ''}`}>
      <View className='flex-row justify-between items-center'>
        <Text className='text-medroom-secondary text-lg font-nunito-bold'>
          { props.title.toUpperCase() }
        </Text>

        { Component && <Component/> }
      </View>

      <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 ${props.row ? 'flex-row' : 'flex-col'} ${props.flex1 ? 'flex-1' : ''}`}>
        { props.children }
      </View>
    </View>
  )
}

export default Section