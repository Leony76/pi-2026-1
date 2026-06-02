import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import Icon from '../ui/Icon'
import { IconName } from 'root/assets/icons';

type Props = {
  onTouch  : () => void;
  selected : boolean;
  text     : string;
  icon     : IconName;
};

const NavMenu = (props:Props): React.JSX.Element => {
  return (
    <TouchableOpacity
    className='justify-center items-center'
    activeOpacity={0.67}
    onPress={props.onTouch}
    >
      <Icon
        name={props.icon}
        color={props.selected ? '#7EDCE2' : 'white'}              
      />

      <Text className={`font-nunito-bold ${props.selected ? 'text-[#7EDCE2]' : 'text-white'}`}>
        { props.text }
      </Text>
    </TouchableOpacity>
  )
}

export default NavMenu