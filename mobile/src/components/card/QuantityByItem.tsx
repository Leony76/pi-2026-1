import React from 'react'
import { Text, TouchableOpacity } from 'react-native';
import { View } from 'react-native'

type Props = {
  Icon : React.ElementType;
  name : string;
  separationRow? : boolean;
  quantity : number;
  addLimit: boolean;
  onTouch: {
    add : () => void;
    sub : () => void;
  };
};

const QuantityByItem = (props:Props): React.JSX.Element => {

  const Icon = props.Icon;
  
  return (
    <>
    <View className='flex-row justify-between items-center'>
      <View className='flex-row gap-2 items-center'>
        <Icon/>

        <Text className='font-nunito-bold text-medroom-primary text-base'>
          { props.name }
        </Text>
      </View>

      <View className='flex-row items-center gap-4'>
        <TouchableOpacity
        onPress={props.onTouch.sub} 
        className='px-3.5 py-1 justify-center items-center bg-white border border-medroom-primaryLight rounded-xl'
        activeOpacity={0.67}
        >
          <Text className='font-nunito-bold text-medroom-primary text-2xl'>
            -
          </Text>
        </TouchableOpacity>    

        <Text className={`font-nunito-bold text-medroom-primary text-lg ${props.addLimit ? 'pr-2' : ''}`}>
          { props.quantity }
        </Text>

        { !props.addLimit &&
          <TouchableOpacity
          onPress={props.onTouch.add} 
          className='px-3 py-1 justify-center items-center bg-white border border-medroom-primaryLight rounded-xl'
          activeOpacity={0.67}
          >
            <Text className='font-nunito-bold text-medroom-primary text-2xl'>
              +
            </Text>
          </TouchableOpacity>
        }
      </View>
    </View>

    { props.separationRow &&
      <View className='h-0.5 w-fill bg-gray-200'/>
    }
    </>
  )
}

export default QuantityByItem