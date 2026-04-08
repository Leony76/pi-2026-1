import React from 'react'
import { Text, TouchableOpacity } from 'react-native';
import { IconName } from 'root/assets/icons';
import Icon from '../ui/Icon';
import { systemColors } from '@/constants/misc/systemColors.misc';

type Props = {
  onTouch : () => void;
  icon?   : {
    name : IconName;
    size?: {
      width  : number;
      height : number;
    };
  };
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
    className={`flex-row justify-center gap-2 rounded-xl py-4 items-center ${props.filled ? 'bg-medroom-primary' : 'bg-[#1aafb408] border border-[#1aafb482]'}  ${props.customStyle?.container ?? ''}`}
    >
      { !!props.icon && 
        <Icon 
          name={props.icon.name}
          color={props.filled ? '#FFFFFF' : systemColors.primary}
          sizes={{ 
            width: props.icon.size?.width    || 24, 
            height: props.icon.size?.height  || 24, 
          }}
        /> 
      }
      
      <Text className={`font-nunito text-lg font-bold tracking-wide ${props.filled ? 'text-white' : 'text-medroom-primary'} ${props.customStyle?.text ?? ''}`}>
        { props.label }
      </Text>
    </TouchableOpacity>
  )
}

export default Default