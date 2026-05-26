import { RoomDisplayCard } from '@/types/room/room.type'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { systemColors } from '@/constants/misc/systemColors.misc';
import { priceFormat } from '@/utils/priceFormat';
import { Link, useRouter } from 'expo-router';
import AvailbilityTag from '../ui/AvailbilityTag';
import { Button } from '../button';
import { RoomService } from '@/services/rooms';
import { useAuth } from '@/contexts/auth.context';
import Toast from '../ui/Toast';
import { AuthHandlers } from '@/types/auth/authHandlers.type';

type Props = RoomDisplayCard & {
  pressable?       : boolean;
  fromManagerView? : boolean;
};

const DisplayRoom = (props:Props): React.JSX.Element => {
  const isPressable = props.pressable ?? true;

  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [ isAvailable, setIsAvailable ] = useState<boolean>(props.isAvailable);
  const [ toggleErrorMessage, setToggleErrorMessage ] = useState<string | null>(null);

  const toggleRoomAvailability = async(): Promise<void> => {
    try {
      if (!token || !refreshToken) return;

      const toggleStatus: boolean = !isAvailable;

      const authHandlers: AuthHandlers = {
        token,
        refreshToken,
        updateTokens,
        signOut,
      };

      const response: { success: boolean } = await RoomService.toggleRoomAvailability(
        String(props.id),
        toggleStatus,
        authHandlers
      );

      if (response.success) setIsAvailable(prev => !prev);
    } catch(error:unknown) {
      if (error instanceof Error) setToggleErrorMessage(error.message);
    }
  };

  const content = (
    <TouchableOpacity 
    activeOpacity={isPressable && props.isAvailable ? 0.67 : 1}
    className='gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3'
    disabled={!isPressable || !props.isAvailable}
    >
      { toggleErrorMessage &&
        <Toast
          message={toggleErrorMessage}
          onClose={() => setToggleErrorMessage(null)}
          visible={!!toggleErrorMessage}
        />
      }

      { props.displayImage ? (
        <View className='relative'>
          <Image
            source={{ uri: props.displayImage }} 
            className='w-full h-48 rounded-lg'
          />

          <AvailbilityTag
            isAvailable={isAvailable}
            tagType='AVAILIBITY'
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

      { props.fromManagerView ? (
        <View className='gap-4'>
          <View className='gap-1'>
            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices.perHour) } <Text className='text-base text-medroom-secondary font-nunito'> / Por dia </Text>
            </Text>
            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices._week) } <Text className='text-base text-medroom-secondary font-nunito'> / Por semana </Text>
            </Text>
            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices.month) } <Text className='text-base text-medroom-secondary font-nunito'> / Por mês </Text>
            </Text>
          </View>

          <Button.Default
            label='Editar sala'
            /// @ts-ignore
            onTouch={() => router.push(`/(authenticated)/(enterprise)/rooms/edit/${props.id}`)}
            icon={{ name: 'edit', size: { height: 20, width: 20 } }}
          />

          <View className='flex-row items-center gap-4'>
            <Button.Toggle
              enabled={isAvailable}
              onToggle={toggleRoomAvailability}
            />

            <Text className={`font-nunito-bold text-[15px] ${ isAvailable ? 'text-green-600' : 'text-red-600' }`}>
              { isAvailable ? 'Sala disponível' : 'Sala indisponível' }
            </Text>
          </View>
        </View>
      ) : (
        props.isAvailable ? (
          <View className='gap-1'>
            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices.perHour) } <Text className='text-base text-medroom-secondary font-nunito'> / Por dia </Text>
            </Text>

            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices._week) } <Text className='text-base text-medroom-secondary font-nunito'> / Por semana </Text>
            </Text>

            <Text className='text-green-700 font-nunito-bold text-xl'>
              { priceFormat(props.prices.month) } <Text className='text-base text-medroom-secondary font-nunito'> / Por mês </Text>
            </Text>
          </View>
        ) : (
          <Text className='font-nunito-bold text-xl' style={{ color: '#FF3939' }}>
            Indisponível
          </Text>
        )
      ) }
    </TouchableOpacity>
  );

  if (!isPressable) {
    return content;
  }

  return (
    <Link
    disabled={!props.isAvailable}
    asChild
    href={{
      pathname: '/(authenticated)/(professional)/roomRentalWizard',
      params: {
        roomId            : props.id, 
        isAvailable       : String(props.isAvailable),
        title             : props.title,
        complementaryData : JSON.stringify(props.complementaryData),
        prices            : JSON.stringify(props.prices),
      }
    }} 
    >
      {content}
    </Link>
  )
}

export default DisplayRoom