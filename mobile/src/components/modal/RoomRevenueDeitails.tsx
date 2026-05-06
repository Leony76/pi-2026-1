import { systemColors } from '@/constants/misc/systemColors.misc';
import { RoomRevenue } from '@/types/roomRevenue.type';
import { priceFormat } from '@/utils/priceFormat';
import { Feather } from '@expo/vector-icons';
import React from 'react'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import Label___Value from '../ui/Label___Value';

type Props = {
  visible        : boolean;
  onRequestClose : () => void;
  roomData: Pick<RoomRevenue, 'room' | 'revenue'>;
};

const RoomRevenueDetails = (props:Props): React.JSX.Element => {
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
            <View className='flex-row justify-between'>
              <Text className='text-medroom-primary font-nunito-bold text-2xl'>
                { props.roomData.room }
              </Text>

              <TouchableOpacity 
              activeOpacity={0.67}
              onPress={props.onRequestClose}
              >
                <Feather 
                  name="arrow-right" 
                  size={26} 
                  color={systemColors.primary} 
                />
              </TouchableOpacity>
            </View>

            <View className='gap-3'>
              <Label___Value
                value={{ _: priceFormat(props.roomData.revenue?.byHour || 0), color: 'text-green-600' }}
                label='Por dia'
                separationRow
              />

              <Label___Value
                value={{ _: priceFormat(props.roomData.revenue?._week || 0), color: 'text-green-600' }}
                label='Por semana'
                separationRow
              />

              <Label___Value
                value={{ _: priceFormat(props.roomData.revenue?.byMonth || 0), color: 'text-green-600' }}
                label='Por mês'
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default RoomRevenueDetails