import React, { useState } from 'react'
import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import Icon from '../ui/Icon'
import { formatDate } from '@/utils/formatDate'
import { DefaultInputProps } from '@/types/defaultInputProps.type'
import { systemColors } from '@/constants/misc/systemColors.misc'
import Entypo from '@expo/vector-icons/Entypo';
import { formatLocalDate } from '@/utils/formatLocalDate'
import { parseLocalDate } from '@/utils/parseLocalDate'

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar.','Abr.','Mai.','Jun.','Jul.','Ago.','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom.','Seg.','Ter.','Qua.','Qui.','Sex.','Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

type DateProps = Omit<DefaultInputProps, 'onChange' | 'type' | 'value'> & {
  onChange: (date: Date | undefined) => void;
  value: Date | string | undefined;
  maxDate?: string;
  minDate?: string;
  markedDates?: Record<string, any>;
};

const DateTime = (props: DateProps): React.JSX.Element => {
  const [show, setShow] = useState(false);

  const selectedDate =
    typeof props.value === 'string'
      ? props.value
      : props.value
        ? formatLocalDate(props.value)
        : ''
    ;

  const handleDayPress = (day: any) => {
    const date = parseLocalDate(day.dateString);

    props.onChange(date);
    setShow(false);
  };

  return (
    <View className='gap-1'>
      <Text className="font-nunito-bold text-lg font-semibold text-medroom-primary">
        {props.label}
      </Text>
      
      <Pressable 
        onPress={() => setShow(true)}
        className='flex-row border-[1.5px] items-center border-medroom-primary rounded-xl py-[7px]' 
      >
        <View className='pr-1 pl-2'>
          <Icon name={props.icon.name || 'calendar'} sizes={{ height: 18, width: 24 }} />
        </View>

        <View className="flex-1">
          <Text className={`font-nunito ${props.value ? 'color-medroom-secondary' : 'color-gray-400'}`}>
            {props.value ? formatDate(props.value) : props.placeholder.text}
          </Text>
        </View>

        <View className='px-2'>
          <Entypo 
            name="chevron-down" 
            size={18} 
            color={systemColors.primary}
          />
        </View>
      </Pressable>

      <Modal 
      transparent 
      visible={show} 
      animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setShow(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-8">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl p-4 w-full overflow-hidden border-2 border-medroom-primary">
                <Calendar
                  current={selectedDate}
                  onDayPress={handleDayPress}                  
                  minDate={props.minDate}                  
                  maxDate={props.maxDate}
                  markedDates={{
                    ...(props.markedDates || {}),
                    [selectedDate ?? '']: { selected: true, disableTouchEvent: true }
                  }}
                  theme={{
                    backgroundColor: '#fffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',             
                    selectedDayBackgroundColor: systemColors.primary, 
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: systemColors.primary,
                    dayTextColor: 'gray',
                    arrowColor: systemColors.primary,
                    monthTextColor: systemColors.primary,
                    indicatorColor: systemColors.primary,
                    textDayFontFamily: 'nunito',
                    textMonthFontFamily: 'nunito-bold',
                    textDayHeaderFontFamily: 'nunito-bold',
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

export default DateTime;