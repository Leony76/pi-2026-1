import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

type Props = {
  onTouch    : () => void;
  startHour  : string;
  endHour    : string;
  selected   : boolean;
  unvailable : boolean;
};

const ShiftHour = (props:Props) => {
  return (
    <TouchableOpacity
    activeOpacity={0.67}
    disabled={props.unvailable}
    onPress={props.onTouch}
    className={`items-center py-2 rounded-lg border border-medroom-primaryLight w-[31%] ${props.unvailable ? 'opacity-50' : props.selected ? 'bg-medroom-primary' : 'bg-[#1aafb408]'}`}
    >
      <Text 
      className={`font-nunito-bold ${props.unvailable ? 'text-medroom-primary line-through' : props.selected ? 'text-white' : 'text-medroom-primary'}`}
      style={props.unvailable ? { textDecorationLine: 'line-through' } : {}}
      >
        { props.startHour }
      </Text>

      <Text 
      className={`font-nunito text-xs text-medroom-primary ${props.unvailable ? 'text-medroom-primary line-through' : props.selected ? 'text-white' : 'text-medroom-primary'}`}
      style={props.unvailable ? { textDecorationLine: 'line-through' } : {}}
      >
        às { props.endHour } 
      </Text>
    </TouchableOpacity>
  )
}

export default ShiftHour