import React, { useState } from 'react'
import { View, Text, Pressable, Modal, FlatList, TouchableOpacity } from 'react-native'
import Icon from '../ui/Icon'
import Entypo from '@expo/vector-icons/Entypo';
import { IconName } from 'root/assets/icons';
import { FullOptionsMapKeys, OPTIONS_MAP } from '@/constants/maps/selectOptions.map';
import { Button } from '../button';
import Feather from '@expo/vector-icons/Feather';
import { systemColors } from '@/constants/misc/systemColors.misc';

type Props = {
  label      : string;
  optionsMap : FullOptionsMapKeys;
  onChange   : (text: string) => void;
  onFocus?   : () => void;
  onBlur?    : () => void;
  icon : {
    name : IconName;
    size?: { 
      width  : number; 
      height : number; 
    };
  };
};

const Style1 = (props:Props): React.JSX.Element => {

  const optionsMap = OPTIONS_MAP[props.optionsMap];

  const [optionsVisible, setOptionsVisible] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('Selecione');

  const handleSelect = (item: { value: string, label: string }) => {
    props.onChange(item.value); 
    setSelectedLabel(item.label); 
    setOptionsVisible(false);    

    if (props.onBlur) props.onBlur();
  };

  return (
    <>
    <View>
      <View className="flex-row items-center gap-2">
        <Icon
          name={props.icon.name}
          sizes={{
            height : props.icon.size?.height || 18,
            width  : props.icon.size?.width  || 24,
          }}
        />

        <Text className="font-nunito text-lg font-semibold text-medroom-primary">
          { props.label }
        </Text>
      </View>
      
      <View 
      className='flex-row border-b-2 items-center border-b-medroom-secondary'
      >
        <Pressable
        className='flex-1 py-2 color-medroom-secondary font-nunito'
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onPress={() => setOptionsVisible(true)}
        > 
          <Text className='font-nunito text-medroom-secondary'>
            { selectedLabel }
          </Text>
        </Pressable>

        <Entypo 
          name="chevron-down" 
          size={24} 
          color={systemColors.primary}
        />
      </View>
    </View>

    <Modal
    visible={optionsVisible}
    onRequestClose={() => setOptionsVisible(false)}
    transparent
    animationType="fade" 
    >
      <Pressable
      className='flex-1 bg-black/30 justify-center items-center' 
      onPress={() => setOptionsVisible(false)}
      >
        <Pressable 
        onPress={(e) => e.stopPropagation()}
        className='bg-white gap-2 p-3 rounded-xl w-[80vw] shadow-[0px_0px_8px_var(--medroom-primary-color)]'
        > 
          <View className='flex-row justify-between'>
            <Text className='font-nunito-bold text-2xl text-medroom-primary'>
              Selecione
            </Text>

            <TouchableOpacity 
            activeOpacity={0.5}
            onPress={() => setOptionsVisible(false)}
            >
              <Feather 
                name="arrow-right" 
                size={24} 
                color={systemColors.primary} 
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={optionsMap}
            keyExtractor={(item, index) => `${item.label}-${index}`}
            ItemSeparatorComponent={() => <View className="h-2" />}
            className='p-1'
            renderItem={({ item, index }) => (
              <Button.Default
                filled={item.label === selectedLabel}
                customStyle={{ container: 'py-[6px]', text: 'text-[14px] font-normal' }}
                key={index}
                label={item.label}
                onTouch={() => handleSelect(item)} 
              />
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
    </>
  )
}

export default Style1