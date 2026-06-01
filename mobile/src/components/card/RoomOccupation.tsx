import React from 'react'
import { Text, View } from 'react-native'
import AvailbilityTag from '../ui/AvailbilityTag';
import { RoomOccupation as RoomOccupationType } from '@/types/room/roomOccupation.type';
import { formatDate } from '@/utils/formatDate';
import { Allocation } from '@/types/room/allocation.type';
import { formatFullDayRange } from '@/utils/formatFullDayRange';

type Props = RoomOccupationType;

const RoomOccupation = (props:Props): React.JSX.Element => {
  return (
    <View className={`gap-2 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3`}>
      <View className='flex-row items-center justify-between'>
        <Text className='font-nunito-bold text-medroom-primary text-xl'>
          { props.title }
        </Text>

        <AvailbilityTag
          textSm
          isAvailable={props.isAvailable}
          tagType='OCCUPANCY'
        />
      </View>

      { !props.isAvailable &&
        props.occupants.map((occupant, index) => (
          <View 
          className='gap-2'
          key={occupant.professionalId}
          >
            <Text className='text-medroom-secondary font-nunito-bold text-sm'>
              Dr(a). { occupant.name } - {occupant.specialty }
            </Text>

            <View className="gap-2"> 
              {occupant.allocations.map((allocation, index) => {

                const allocationTimeLimitsByType: Record<Allocation, string> = {
                  DAILY : `Diário  - ${ formatFullDayRange(allocation.startDate) }`,
                  MONTH : `Mensal  - ${ formatDate(allocation.startDate) } à ${ formatDate(allocation.endDate) }`,
                  WEEK  : `Semanal - ${ formatDate(allocation.startDate) } à ${ formatDate(allocation.endDate) }`,
                };

                return (
                  <Text 
                  key={index} 
                  className="text-medroom-secondary font-nunito text-sm"
                  >
                    •  { allocationTimeLimitsByType[allocation.type] }
                  </Text>
              )})}
            </View>
            
            { props.occupants.length - 1 !==  index &&
              <View className='h-0.5 w-fill bg-gray-200'/>
            }
          </View>
        ))}
    </View>
  )
}

export default RoomOccupation