import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import AvailbilityTag from '../ui/AvailbilityTag';
import { formatHour } from '@/utils/formatHour';
import { RoomOccupation as RoomOccupationType } from '@/types/roomOccupation.type';

type Props = RoomOccupationType;

const RoomOccupation = (props:Props): React.JSX.Element => {

  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date().getTime();
      const start = new Date(props.occupation.startTime ?? '').getTime();
      const end = new Date(props.occupation.endTime ?? '').getTime();

      if (now < start) return setProgress(0);
      if (now > end) return setProgress(100);

      const totalDuration = end - start;
      const elapsed = now - start;
      const percentage = (elapsed / totalDuration) * 100;

      setProgress(percentage);
    };
    
    if (props.occupation.endTime && props.occupation.startTime) {
      calculateProgress();
    }

    const interval = setInterval(calculateProgress, 60000);

    return () => clearInterval(interval);
  }, [props.occupation.startTime, props.occupation.endTime]);

  return (
    <View className={`gap-2 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3`}>
      <View className='flex-row items-center justify-between'>
        <Text className='font-nunito-bold text-medroom-primary text-xl'>
          { props.title }
        </Text>

        <AvailbilityTag
          textSm
          isAvailable={props.isAvailable}
          tagType='AVAILIBITY'
        />
      </View>

      <View className='h-2 w-full bg-gray-200 rounded-2xl overflow-hidden'>
        <View 
          className='h-full bg-medroom-primary rounded-2xl'
          style={{ width: `${props.isAvailable ? 0 : progress}%` }} 
        />
      </View>

      { !props.isAvailable && props.occupation.endTime &&
        <Text className='text-medroom-secondary font-nunito text-sm'>
          Dr(a). { props.occupant } - saída { formatHour(props.occupation.endTime) }
        </Text>
      }
    </View>
  )
}

export default RoomOccupation