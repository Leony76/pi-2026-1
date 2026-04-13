import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  isAvailable : boolean;
  closed?     : boolean;
  aboslute?   : string;
  tagType     : 'ACTIVITY' | 'AVAILIBITY';
};

const AvailbilityTag = (props:Props): React.JSX.Element => {
  return (
    <View className={`
      py-1 rounded-lg justify-center items-center border 
      ${props.closed 
          ? 'border-gray-300 bg-gray-100' :      
        props.isAvailable 
          ? 'border-green-400 bg-green-100' 
          : 'border-red-400 bg-red-100'
      } 
      ${props.aboslute ?? ''}
      ${props.tagType === 'ACTIVITY' ? 'px-3' : 'px-6'}
    `}>
      <Text className={`font-nunito ${
        props.closed
          ? 'text-medroom-secondary' :
        props.isAvailable 
          ? 'text-green-600' 
          : 'text-red-600'
      }`}>
        { props.closed 
            ? 'Encerrado' :  
          props.isAvailable 
            ? props.tagType === 'AVAILIBITY' 
              ? 'Disponível' 
              : 'Ativo'
            : props.tagType === 'AVAILIBITY' 
              ? 'Indisponível' 
              : 'Inativo'
        }
      </Text>
    </View>
  )
}

export default AvailbilityTag