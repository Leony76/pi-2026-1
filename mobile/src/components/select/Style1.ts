import { useState } from 'react'
import { View, TextInput, Text, KeyboardTypeOptions } from 'react-native' 
import Icon from '../ui/Icon'
import { IconName } from 'root/assets/icons';

type Props = {
  label           : string;
  value           : string;
  type            : 'PASSWORD' | 'TEXT';
  autoCorrect?    : boolean;
  keyboardType?   : KeyboardTypeOptions; 
  autoCapitalize? : "none" | "sentences" | "words" | "characters";
  onChange        : (text: string) => void;
  onFocus?        : () => void;
  onBlur?         : () => void;
  icon : {
    name : IconName;
    size?: { 
      width  : number; 
      height : number; 
    };
  };
  placeholder : {
    color?: string;
    text  : string;
  };
};

const Style1 = (props:Props) => {

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  return (
    <View>
      
    </View> 
  )  
}

export default Style1