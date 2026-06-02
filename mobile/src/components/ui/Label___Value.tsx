import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type Props = {
  label?          : string;
  onTouch?        : () => void;
  LabelComponent? : React.ElementType;
  separationRow?  : boolean;
  boldLabel?      : boolean;
  gap? : `gap-${number}`;
  value: {
    _?         : string;
    color?     : string;
    Component? : React.ElementType;
  }
};

const Label___Value = (props:Props): React.JSX.Element => {

  const ValueComponent = props.value.Component;
  const LabelComponent = props.LabelComponent;
  const normalizedValue = typeof props.value._ === 'object' && props.value._ !== null
    ? JSON.stringify(props.value._)
    : props.value._;

  return (
    <TouchableOpacity 
    activeOpacity={0.67}
    disabled={props.onTouch ? false : true}
    onPress={props.onTouch}
    className={`${props.gap ? props.gap : 'gap-3'}`}
    >
      <View className='justify-between flex-row w-full items-center'>
        { LabelComponent ? (
          <LabelComponent/>
        ) : (
          <Text className={`text-medroom-secondary ${ props.boldLabel ? 'font-nunito-bold' : 'font-nunito' }`}>
            { props.label }
          </Text>
        )}

        {normalizedValue ? (
          <Text className={`font-nunito-bold ${props.value.color ?? 'text-medroom-primary'}`}>
            {normalizedValue}
          </Text>
        ) : (
          ValueComponent && <ValueComponent />
        )}
      </View>

      { props.separationRow && 
        <View className='h-0.5 w-fill bg-gray-200'/>
      }
    </TouchableOpacity>
  )
}

export default Label___Value