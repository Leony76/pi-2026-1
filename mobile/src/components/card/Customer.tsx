import React from 'react'
import { Text, View } from 'react-native'
import { getColorByName } from '@/utils/getAvatarPlaceholderColorByName';
import { CustomerHistory, Customer as CustomerType } from '@/types/customer.type';
import { SPECIALTY_MAP } from '@/constants/maps/specialty.map';
import { formatLimitDate } from '@/utils/formatLimitDate';
import { formatMonthNameAndYear } from '@/utils/formatMonthNameAndYear';
import { getDisplayNameOrInitials } from '@/utils/getDisplayNameOrInitials';

type BaseProps = {
  gap? : `gap-${number}`;
  separationRow?: boolean;
};

type Props = BaseProps & CustomerType & {
  from : 'ACTIVES';
} | BaseProps & CustomerHistory & {
  from: 'HISTORY';
};

const Customer = (props:Props): React.JSX.Element => {

  const nameToDisplay = getDisplayNameOrInitials(props.name);
  const colors = getColorByName(props.name);

  return (
    <View className={`${props.gap ?? ''}`}>
      <View className='flex-row items-center justify-between gap-3'>
        <View className='flex-row items-center gap-3'>
          <View 
          className='rounded-[50%] justify-center items-center w-[50px] h-[50px] p-4'
          style={{ backgroundColor: colors?.bg }}
          >
            <Text 
            className='font-nunito-bold text-base'
            style={{ color: colors?.text }}
            >
              { nameToDisplay.initials.toUpperCase() }
            </Text>
          </View>

          <View>
            <Text className='text-medroom-primary text-lg font-nunito-bold'>
              { nameToDisplay.displayName }
            </Text>

            <Text className='text-[13px] font-nunito text-gray-600'>
              { props.specialty } - { props.occupiedRoom } { props.from === 'HISTORY' ? `- ${ formatMonthNameAndYear(props.unoccupiedRoomAt) }` : '' }
            </Text>
          </View>
        </View>

        { props.from === 'ACTIVES' &&
      
          <View className='items-end'>
            <Text className='text-medroom-primary text-sm font-nunito-bold'>
              { props.occupation.startHour } às { props.occupation.endHour }
            </Text>

            <Text className='text-[13px] font-nunito text-gray-600'>
              Até { formatLimitDate(props.occupation.limitDate) }
            </Text>
          </View>
        }
      </View>

      { props.separationRow &&
        <View className='h-0.5 w-fill bg-gray-200'/>
      }
    </View>
  )
}

export default Customer