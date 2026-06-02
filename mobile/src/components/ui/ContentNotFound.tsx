import React from 'react'
import { Text, View } from 'react-native'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { systemColors } from '@/constants/misc/systemColors.misc';

type Props = {
  text: string;
};

const ContentNotFound = (props:Props): React.JSX.Element => {
  return (
    <View className='mt-2 justify-center items-center gap-2'>
      <FontAwesome5 
        name='question'
        size={20} 
        color={systemColors.secondary} 
      />

      <Text className='text-medroom-secondary text-center font-nunito'>
        { props.text }
      </Text>
    </View>
  )
}

export default ContentNotFound