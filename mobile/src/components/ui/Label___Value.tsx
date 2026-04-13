import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  label          : string;
  separationRow? : boolean;
  boldLabel?     : boolean;
  gap? : `gap-${number}`;
  value: {
    _?         : string;
    color?     : string;
    Component? : React.ElementType;
  }
};

const Label___Value = (props:Props): React.JSX.Element => {

  const ValueComponent = props.value.Component;

  return (
    <View className={`${props.gap ? props.gap : 'gap-3'}`}>
      <View className='justify-between flex-row w-full items-center'>
        <Text className={`text-medroom-secondary ${ props.boldLabel ? 'font-nunito-bold' : 'font-nunito' }`}>
          { props.label }
        </Text>

        {props.value._ ? (
          <Text className={`font-nunito-bold ${props.value.color ?? 'text-medroom-primary'}`}>
            {props.value._}
          </Text>
        ) : (
          ValueComponent && <ValueComponent />
        )}
      </View>

      { props.separationRow && 
        <View className='h-0.5 w-fill bg-gray-200'/>
      }
    </View>
  )
}

export default Label___Value