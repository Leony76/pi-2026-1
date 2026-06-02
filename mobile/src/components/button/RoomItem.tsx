import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

type Props = {
  onTouch    : () => void;
  Icon       : React.ElementType;
  name       : string;
  selected?  : boolean;
  unvailable?: boolean;
};

const RoomItem = (props:Props): React.JSX.Element => {

  const Icon = props.Icon;

  return (
    <TouchableOpacity
    activeOpacity={0.67}
    disabled={props.unvailable}
    onPress={props.onTouch}
    className={`items-center justify-center py-2 gap-1 rounded-lg border border-medroom-primaryLight w-[31%] ${props.unvailable ? 'opacity-50' : props.selected ? 'bg-medroom-primary' : 'bg-[#1aafb408]'}`}
    >
      <Icon/> 

      <Text 
      className={`font-nunito-bold text-sm text-medroom-primary ${props.unvailable ? 'text-medroom-primary line-through' : props.selected ? 'text-white' : 'text-medroom-primary'}`}
      style={props.unvailable ? { textDecorationLine: 'line-through' } : {}}
      >
        { props.name } 
      </Text>
    </TouchableOpacity>
  )
}

export default RoomItem