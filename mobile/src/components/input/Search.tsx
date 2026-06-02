import React from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather';
import { systemColors } from '@/constants/misc/systemColors.misc';
import Fontisto from '@expo/vector-icons/Fontisto';

type Props = {
  onChangeText : ( text:string ) => void;
  clear        : () => void;
  value        : string;
};

const Search = (props:Props): React.JSX.Element => {
  return (
    <View className='flex-row border-2 rounded-xl border-medroom-primaryLight items-center'>
      <Feather
        className='px-2 pl-3' 
        name="search" 
        size={20} 
        color={systemColors.primary}
      />

      <TextInput
        className='flex-1 py-2 text-medroom-secondary font-nunito'
        placeholder='Pesquisar'
        placeholderTextColor={systemColors.primary}
        onChangeText={props.onChangeText}
        value={props.value}
      />

      {props.value.length > 0 && (
        <TouchableOpacity 
        activeOpacity={0.67} 
        onPress={props.clear}
        >
          <Fontisto 
            className='px-2 pr-3.5'
            name="close-a" 
            size={12} 
            color={systemColors.primary} 
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default Search