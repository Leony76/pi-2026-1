import React from 'react'
import { Text, View } from 'react-native'
import { getColorByName } from '@/utils/getAvatarPlaceholderColorByName';
import { CustomerHistory, Customer as CustomerType } from '@/types/customer/customer.type';
import { formatMonthNameAndYear } from '@/utils/formatMonthNameAndYear';
import { getDisplayNameOrInitials } from '@/utils/getDisplayNameOrInitials';
import { formatDate } from '@/utils/formatDate';
import { ALLOCATION_MAP } from '@/constants/maps/allocationType.map';

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
              { props.specialty } - { props.occupiedRoom } - { ALLOCATION_MAP[props.allocationType] }
            </Text>
          </View>
        </View>

        <View className='items-end'>
          <Text className='text-medroom-primary text-sm font-nunito-bold'>
            {
              props.from === 'ACTIVES'
                ? props.allocationType === 'DAILY'
                  ? formatDate(props.occupation.startHour ?? '')
                  : `${formatDate(props.occupation.startHour ?? '')} até ${formatDate(props.occupation.endHour ?? '')}`
                : props.allocationType === 'DAILY'
                  ? formatDate(props.startDate)
                  : `${formatDate(props.startDate)} até ${formatDate(props.endDate)}`
            }
          </Text>

          <Text className='text-[13px] font-nunito text-gray-600'>
            00:00 às 23:59
          </Text>
        </View>
      </View>

      { props.separationRow &&
        <View className='h-0.5 w-fill bg-gray-200'/>
      }
    </View>
  )
}

export default Customer