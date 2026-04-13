import React from 'react'
import { Text, View } from 'react-native';

type Props = {
  hour         : string;
  dayMonthYear : string;
  type         : 'ENTRY' | 'EXIT';        
};

const EntryAndExit = (props:Props): React.JSX.Element => {
  return (
    <View className={`
      border-2 flex-1 p-3 rounded-xl 
      ${ props.type === 'ENTRY' 
        ? 'border-green-300 bg-green-100/25' 
        : 'border-red-200 bg-red-100/25' 
      }
    `}>
      <Text className='text-medroom-secondary font-nunito-bold text-lg'>
        { props.type === 'ENTRY' 
          ? 'Entrada'
          : 'Saída'
        }
      </Text>

      <Text className={`
        text-4xl font-nunito-bold 
        ${ props.type === 'ENTRY' 
          ? 'text-green-700' 
          : 'text-red-700' 
        }
      `}>
        { props.hour }
      </Text>

      <Text className='text-medroom-secondary font-nunito-bold'>
        { props.dayMonthYear }
      </Text>
    </View>
  )
}

export default EntryAndExit