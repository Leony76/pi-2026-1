import { KeyboardTypeOptions } from "react-native";
import { IconName } from "root/assets/icons";
import { InputType } from "./input.type";

export type DefaultInputProps = {
  label           : string;
  value           : string;
  type            : InputType;
  autoCorrect?    : boolean;
  maxLength?      : number;
  keyboardType?   : KeyboardTypeOptions; 
  ExteriorIcon?   : React.ElementType;
  autoCapitalize? : "none" | "sentences" | "words" | "characters";
  onChange        : (text: string) => void;
  onFocus?        : () => void;
  onBlur?         : () => void;
  icon: {
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