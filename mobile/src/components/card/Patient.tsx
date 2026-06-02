import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import AvailbilityTag from '../ui/AvailbilityTag';
import { getColorByName } from '@/utils/getAvatarPlaceholderColorByName';
import { Patient as PatientType } from '@/types/patient/patient.type';
import { History } from '@/types/room/history.type';
import { useRouter } from 'expo-router';
import { getDisplayNameOrInitials } from '@/utils/getDisplayNameOrInitials';
import { formatHour } from '@/utils/formatHour';
import { formatDate } from '@/utils/formatDate';

type BaseProps = {
  separationRow? : boolean;
  gap? : `gap-${number}`;
};

type Props = | BaseProps & PatientType & {
  from: 'ACTIVES';
} | BaseProps & History & {
  from: 'HISTORY';
};

const Patient = (props:Props): React.JSX.Element => {

  const router = useRouter();

  const name = props.from === 'ACTIVES' 
    ? props.name 
    : props.patientName
  ;

  const sessionLabel = props.from === 'ACTIVES'
    ? 'Próxima sessão:'
    : 'Ùltima sessão:'
  ;

  const session = props.from === 'ACTIVES'
    ? `${formatDate(props.nextSession.startHour)} - ${formatHour(props.nextSession.startHour)} às ${formatHour(props.nextSession.endHour)}`
    : `${formatDate(props.lastSession.startHour)} - ${formatHour(props.lastSession.startHour)} às ${formatHour(props.lastSession.endHour)}`
  ;

  const nameToDisplay = getDisplayNameOrInitials(name); 

  const colors = getColorByName(name);

  return (
    <View className={`${props.gap ?? ''}`}>
      <TouchableOpacity
      activeOpacity={0.67}
      disabled={props.from === 'HISTORY'}
      onPress={() => router.push({
        pathname: "/(authenticated)/(professional)/patients/[id]",
        params: { id: props.id }
      })}
      >
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
              <Text className='text-medroom-primary text-xl font-nunito-bold'>
                { nameToDisplay.displayName }
              </Text>

              <Text className='text-[13px] font-nunito text-gray-600'>
                { sessionLabel } { session }
              </Text>
            </View>
          </View>

          <View className='relative self-start'>
            <AvailbilityTag
              tagType={'ACTIVITY'}
              closed={props.status === 'CLOSED'}
              isAvailable={props.status === 'ACTIVE'}
            />
          </View>
        </View>
      </TouchableOpacity>

      { props.separationRow &&
        <View className='h-0.5 w-fill bg-gray-200'/>
      }
    </View>
  )
}

export default Patient