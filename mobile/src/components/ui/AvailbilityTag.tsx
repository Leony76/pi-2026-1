import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  isAvailable : boolean;
  closed?     : boolean;
  aboslute?   : string;
  tagType     : 'ACTIVITY' | 'AVAILIBITY';
};

const AvailbilityTag = (props:Props) => {
  return (
    <View className={`
      py-1 px-6 rounded-lg justify-center items-center border 
      ${props.closed 
          ? 'border-medroom-secondary bg-gray-100' :      
        props.isAvailable 
          ? 'border-green-400 bg-green-100' 
          : 'border-red-400 bg-red-100'
      } 
      ${props.aboslute ?? ''}
    `}>
      <Text className={
        props.closed
          ? 'text-medroom-secondary' :
        props.isAvailable 
          ? 'text-green-600' 
          : 'text-red-600'
      }>
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