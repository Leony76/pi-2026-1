import React from 'react'
import { Text } from 'react-native';
import { Modal, Pressable, View } from 'react-native'
import { Button } from '../button';

type Props = {
  visible        : boolean;
  confirmMessage : string;
  onRequestClose : () => void;
  onConfirm      : () => void;
};

const ConfirmAction = (props:Props) => {
  return (
    <Modal 
    transparent 
    visible={props.visible} 
    animationType="fade"
    >
      <Pressable 
      onPress={props.onRequestClose}
      className="flex-1 bg-black/50 justify-center items-center"      
      >
        <Pressable 
        onPress={(e) => e.stopPropagation()}
        className='w-full max-w-[325px]'
        >
          <View className='bg-white gap-3 p-3 py-4 rounded-xl border-2 border-medroom-primaryLight'>
            <Text className='text-xl font-nunito-bold text-medroom-primary'>
              Confirmar ação
            </Text>

            <Text className='text-medroom-primary font-nunito'>
              { props.confirmMessage }
            </Text>

            <View className='flex-row gap-2 h-10'>
              <Button.Default
                label='Confirmar'
                filled
                onTouch={props.onConfirm}
                icon={{ name: 'check', size: { height: 24, width: 24 } }}
                customStyle={{ container: 'flex-1', text: 'text-sm' }}
              />

              <Button.Default
                label='Cancelar'
                onTouch={props.onRequestClose}
                icon={{ name: 'x_circle', size: { height: 20, width: 20 } }}
                customStyle={{ container: 'flex-1', text: 'text-sm' }}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default ConfirmAction