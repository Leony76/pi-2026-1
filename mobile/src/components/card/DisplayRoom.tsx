import { RoomDisplayCard } from '@/types/room.type'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { systemColors } from '@/constants/misc/systemColors.misc';
import { priceFormat } from '@/utils/priceFormat';
import { Link } from 'expo-router';
import AvailbilityTag from '../ui/AvailbilityTag';

const DisplayRoom = (props:RoomDisplayCard): React.JSX.Element => {
  return (
    <Link
    asChild
    href={{
      pathname: '/(authenticated)/roomRentalWizard',
      params: {
        roomId            : props.id, 
        isAvailable       : String(props.isAvailable),
        title             : props.title,
        complementaryData : JSON.stringify(props.complementaryData),
        prices            : JSON.stringify(props.prices),
      }
    }} 
    >
      <TouchableOpacity 
      activeOpacity={0.67}
      className='gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3'
      >
        { props.displayImage ? (
          <View className='relative'>
            <Image
              source={{ uri: props.displayImage }} 
              className='w-full h-48 rounded-lg'
            />

            <AvailbilityTag
              isAvailable={props.isAvailable}
              aboslute='absolute top-2 right-2'
            />
          </View>
        ) : (
          <View className='bg-medroom-primaryLight justify-center items-center w-full rounded-lg h-48'>
            <FontAwesome6 
              name="image" 
              size={32} 
              color={systemColors.primary} 
            />
          </View>
        )}

        <View>
          <Text className='text-xl font-nunito-bold text-medroom-primary'>
            { props.title }
          </Text>

          <Text className='text-medroom-secondary'>
            { props.complementaryData.floor } - { props.complementaryData.area }m² - { props.complementaryData.additional }
          </Text>
        </View>

        { props.isAvailable ? (
          <View className='gap-1'>
            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices.perHour) } <Text className='text-base text-medroom-secondary font-nunito'> / Por hora </Text>
            </Text>

            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices._3xWeek) } <Text className='text-base text-medroom-secondary font-nunito'> / 3x semana </Text>
            </Text>

            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices.month) } <Text className='text-base text-medroom-secondary font-nunito'> / Por mês </Text>
            </Text>
          </View>
        ) : (
          <Text className='font-nunito-bold text-xl' style={{ color: '#FF3939' }}>
            Indisponível
          </Text>
        )}
      </TouchableOpacity>
    </Link>
  )
}

export default DisplayRoom