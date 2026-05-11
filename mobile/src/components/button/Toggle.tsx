import { systemColors } from '@/constants/misc/systemColors.misc';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

type Props = {
  enabled: boolean;
  onToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const Toggle = (props: Props): React.JSX.Element => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: props.enabled ? 24 : 0, 
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [props.enabled]);

   return (
    <View
    className={`
      border-2 rounded-2xl self-start p-px mb-1 ml-2
      ${ props.enabled ? 'border-green-600 bg-[#eefae6]' : 'border-red-600 bg-[#ffcfc7]' }
    `}
    style={{
      transform: [
        { scaleX: 1.3 },
        { scaleY: 1.3 },
      ],
    }}
    >
      <Switch
        trackColor={{ false: "#ffcfc7", true: '#eefae6' }}
        thumbColor={props.enabled ? 'green' : '#dc2626'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={props.onToggle}
        value={props.enabled}
      />
    </View>
  );
};

export default Toggle;