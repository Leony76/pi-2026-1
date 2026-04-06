import React from 'react'
import { Text, TouchableOpacity } from 'react-native';
import { IconName } from 'root/assets/icons';
import Icon from '../ui/Icon';

type Props = {
  onTouch : () => void;
  icon?   : IconName;
  filled? : boolean;
  label   : string;
  customStyle? : {
    container? : string;
    text?      : string;
  };
};

const Default = (props:Props) => {
  return (
    <TouchableOpacity
    onPress={props.onTouch}
    activeOpacity={0.85}
    className={`flex-row justify-center gap-2 rounded-xl py-4 items-center ${props.filled ? 'bg-medroom-primary' : 'bg-[#1aafb410] shadow-[0px_0px_4px_var(--medroom-primary-color)]'}  ${props.customStyle?.container ?? ''}`}
    >
      { props.icon && 
        <Icon 
          name={props.icon}
          color={props.filled ? 'white' : 'var(--medroom-primary-color)'}
        /> 
      }
      
      <Text className={`font-nunito text-lg font-bold tracking-wide ${props.filled ? 'text-white' : 'text-medroom-primary'} ${props.customStyle?.text ?? ''}`}>
        { props.label }
      </Text>
    </TouchableOpacity>
  )
}

export default Default