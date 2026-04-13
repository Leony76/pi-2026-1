import React from 'react'
import { Image, Modal, TouchableWithoutFeedback, View } from 'react-native'

type Props = {
  visible        : boolean;
  onRequestClose : () => void;
  image          : string;
};

const ImageExpanded = (props:Props): React.JSX.Element => {
  return (
    <Modal 
    transparent 
    visible={props.visible} 
    animationType="fade"
    >
      <TouchableWithoutFeedback onPress={props.onRequestClose}>
        <View className="flex-1 bg-black/60 justify-center items-center">
          <TouchableWithoutFeedback onPress={props.onRequestClose}>
            <Image
              source={{ uri: props.image }}
              resizeMode="contain" 
              className='w-full h-full' 
            />
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

export default ImageExpanded