import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { IconName } from 'root/assets/icons';
import Icon from '../ui/Icon';
import { systemColors } from '@/constants/misc/systemColors.misc';

type Props = {
  onTouch      : () => void;
  disable?     : boolean;
  loading?     : boolean; 
  borderStyle? :  'DASHED';
  textLineThrough? : boolean;
  icon? : {
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

const Default = (props:Props): React.JSX.Element => {
  return (
    <TouchableOpacity
    disabled={props.disable}
    onPress={props.onTouch}
    activeOpacity={0.85}
    className={`
      flex-row justify-center gap-2 rounded-xl py-4 items-center 
      ${props.customStyle?.container ?? ''} 
      ${props.filled 
        ? 'bg-medroom-primary' 
        : 'bg-[#1aafb408] border border-[#1aafb482]'
      }  
      ${props.borderStyle === 'DASHED'
        ? 'border-dashed' : ''
      }
      ${props.disable 
        ? 'opacity-50' 
        : undefined
      }
    `}
    >
      { props.loading ? (
        <ActivityIndicator
          size="small"
          color="#fff"
        />
      ) : props.icon ? (
        <Icon 
          name={props.icon.name}
          color={props.filled ? '#FFFFFF' : systemColors.primary}
          sizes={{ 
            width: props.icon.size?.width || 24, 
            height: props.icon.size?.height || 24, 
          }}
        />
      ) : null }
      
      <Text 
      style={props.textLineThrough ? { textDecorationLine: 'line-through' } : undefined}
      className={`
        text-lg font-nunito-bold tracking-wide 
        ${props.filled ? 'text-white font-nunito' : 'text-medroom-primary'} 
        ${props.customStyle?.text ?? ''}
      `}>
        { props.label }
      </Text>
    </TouchableOpacity>
  )
}

export default Default