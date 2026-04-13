import React, { useState } from 'react'
import { View, TextInput, Text, Pressable } from 'react-native'
import Icon from '../ui/Icon'
import { systemColors } from '@/constants/misc/systemColors.misc';
import { DefaultInputProps } from '@/types/defaultInputProps.type';

type Props = DefaultInputProps;

const Style1 = (props:Props): React.JSX.Element => {

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <Icon
          name={props.icon.name}
          sizes={{
            height : props.icon.size?.height || 18,
            width  : props.icon.size?.width || 24,
          }}
        />

        <Text className="font-nunito text-lg font-semibold text-medroom-primary">
          { props.label }
        </Text>
      </View>
      
      <View 
      className='flex-row border-b-2 items-center border-b-medroom-secondary'
      >
        <TextInput
          className='flex-1 py-2 color-medroom-secondary font-nunito'
          value={props.value}
          maxLength={props.maxLength}
          onChangeText={props.onChange}
          secureTextEntry={props.type === 'PASSWORD' && !passwordVisible ? true : false}
          autoCapitalize={props.type === 'PASSWORD' && !passwordVisible ? 'none' : (props.autoCapitalize || 'none')}
          autoCorrect={props.type === 'PASSWORD' && !passwordVisible ? false : (props.autoCorrect || false)}
          underlineColorAndroid="transparent"
          placeholder={props.placeholder.text}
          placeholderTextColor={props.placeholder.color || systemColors.secondary}
          keyboardType={props.keyboardType || 'default'}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        />

        { props.type === 'PASSWORD' &&
          <Pressable
          className='px-1'
          onPress={() => setPasswordVisible(prev => !prev)}
          >
            <Icon       
              name={passwordVisible ? 'opened_eye' : 'closed_eye'}
            />
          </Pressable>
        }
      </View>
    </View>
  )
}

export default Style1