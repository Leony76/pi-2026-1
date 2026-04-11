import { Button } from '@/components/button';
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import AvailbilityTag from '@/components/ui/AvailbilityTag';
import Label___Value from '@/components/ui/Label___Value';
import Section from '@/components/ui/Section';
import { DAYS } from '@/constants/maps/days.map';
import { HOURS_MAP } from '@/constants/maps/roomsHours.map';
import { TRANSLATED_DAYS_MAP } from '@/constants/maps/translatedDays.map';
import { systemColors } from '@/constants/misc/systemColors.misc';
import { Allocation } from '@/types/allocation.type';
import { _3xWeek, Days } from '@/types/days.type';
import { HourShift } from '@/types/hourShift.type';
import { RoomDisplayCard } from '@/types/room.type';
import { isHourOccupied } from '@/utils/isHourOccuped';
import { priceFormat } from '@/utils/priceFormat';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native';

// Supondo que virá essa informação da API.
const OCCUPIED_HOURS_FROM_ROOM: HourShift[] = [
  { startHour: '09:00', endHour: '10:00' },
  { startHour: '14:00', endHour: '15:00' },
];

// Supondo que virá essa informação da API.
const OCCUPIED_DAYS_FROM_ROOM: Days[] = [
  'FRIDAY',
  'MONDAY',
  'SATURDAY',
];

const roomRentalWizard = (): React.JSX.Element => {

  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [allocationType, setAllocationType] = useState<Allocation | null>(null);
  const [wizardStep, setWizardStep] = useState<number>(1);

  const [shiftSelected, setShiftSelected] = useState<'MORNING' | 'AFTERNOON' | 'NIGHT' | 'UNSELECTED'>('UNSELECTED');
  const [hourSelected, setHourSelected] = useState<HourShift | null>(null);
  const [daysSelected, setDaysSelected] = useState<Days[]>([]);
  const [daySelected, setDaySelected] = useState<Days | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'BANK_SLIP' | 'CREDIT_CARD' | null>(null);

  const title = params.title as string ?? '[Não fornecido]';
  const roomId = params.roomId as string ?? '[Não suposto a existir]';
  const isAvailable = params.isAvailable === 'true';

  const prices: RoomDisplayCard['prices'] = params.prices 
    ? JSON.parse(params.prices as string) 
    : { perHour: 0, _3xWeek: 0, month: 0 };

  const complementaryData: RoomDisplayCard['complementaryData'] = params.complementaryData 
    ? JSON.parse(params.complementaryData as string) 
    : { floor: '[Não fornecido]', area: '[Não fornecida]', additional: '[Não fornecido]' };

  const handleDayPress = (day: Days): void => {
    setDaysSelected((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } 
      
      if (prev.length >= 3) {
        return [...prev.slice(1), day];
      } 
      
      return [...prev, day];
    });
  };

  const handleSwitchAllocationDataClean = ():void => {
    setShiftSelected('UNSELECTED');
    setHourSelected(null);
    setPaymentMethod(null);
    setDaySelected(null);
    setDaysSelected([]);
  };

  useEffect(() => {
    if (wizardStep >= 3) {
      router.replace({
        pathname: '/(authenticated)/(professional)/roomRentalSuccess',
        params: {
          roomName  : title.split('-')[0],
          allocationType : allocationType,
          startHour : hourSelected?.startHour, 
          endHour   : hourSelected?.endHour, 
          days      : JSON.stringify(daysSelected),
          pricePaid : allocationType === '3X_WEEK'
            ? prices._3xWeek
          : allocationType === 'MONTH'
            ? prices.month
            : prices.perHour
        }
      });
    }
  },[wizardStep]);

  return (
    <LayoutWrapper>
      <SystemLayout
      layoutType='PROFESSIONAL'
      tab='HOME'
      title={wizardStep === 2 ? 'Pagamento' : title}
      description={`${wizardStep === 2 ? 'Escolha a forma de pagamento' : complementaryData.floor + ' - ' + complementaryData.area + 'm² - ' + complementaryData.additional}`}
      goBack={() => {
        if (wizardStep === 1) {
          handleSwitchAllocationDataClean();
          router.replace('/(authenticated)/(professional)/home');
        } else { 
          setPaymentMethod(null);
          setWizardStep(1);
        }
      }}
      >
        <ScrollView contentContainerClassName='gap-5 py-6'>
          { wizardStep === 1 ? (
            <>
              <Section title='Informações'>
                <Label___Value
                  separationRow
                  label='Andar'
                  value={{ _: complementaryData.floor }}
                />

                <Label___Value
                  separationRow
                  label='Área'
                  value={{ _: `${complementaryData.area}m²` }}
                />

                <Label___Value
                  separationRow
                  label={ complementaryData.additional }
                  value={{ _: `Sim` }}
                />

                <Label___Value
                  label='Status'
                  value={{ Component: () => (
                    <AvailbilityTag
                      isAvailable={isAvailable}
                    /> 
                  )}}
                />
              </Section>

              <Section title='TIPOS DE ALOCAÇÃO' row>
                <Button.Default
                  label='Por hora'
                  filled={allocationType === 'PER_HOUR'}
                  customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
                  onTouch={() => {
                    setAllocationType(allocationType === 'PER_HOUR' ? null : 'PER_HOUR');
                    handleSwitchAllocationDataClean();
                  }}
                  />

                <Button.Default
                  label='3x Semana'
                  filled={allocationType === '3X_WEEK'}
                  customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
                  onTouch={() => {
                    setAllocationType(allocationType === '3X_WEEK' ? null : '3X_WEEK')
                    handleSwitchAllocationDataClean();
                  }}
                  />

                <Button.Default
                  label='Mês'
                  filled={allocationType === 'MONTH'}
                  customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
                  onTouch={() => {
                    setAllocationType(allocationType === 'MONTH' ? null : 'MONTH');
                    handleSwitchAllocationDataClean();
                  }}
                />
              </Section>

              { allocationType === 'PER_HOUR' ? (
                <>
                  <Section title='Selecione o turno'>
                    <View className='flex-row gap-3'>
                      <Button.Default
                        label='Manhã'
                        filled={shiftSelected === 'MORNING'}
                        customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
                        onTouch={() => {
                          setShiftSelected(shiftSelected === 'MORNING' ? 'UNSELECTED' : 'MORNING');
                          setHourSelected(null);
                        }}
                      />

                      <Button.Default
                        label='Tarde'
                        filled={shiftSelected === 'AFTERNOON'}
                        customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
                        onTouch={() => {
                          setShiftSelected(shiftSelected === 'AFTERNOON' ? 'UNSELECTED' : 'AFTERNOON');
                          setHourSelected(null);
                        }}
                      />

                      <Button.Default
                        label='Noite'
                        filled={shiftSelected === 'NIGHT'}
                        customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}        
                        onTouch={() => {
                          setShiftSelected(shiftSelected === 'NIGHT' ? 'UNSELECTED' : 'NIGHT');
                          setHourSelected(null);
                        }}
                      />
                    </View>
                    
                    { shiftSelected !== 'UNSELECTED' &&
                      <>
                        <View className='h-0.5 w-fill bg-gray-200'/>

                        <View className='flex-row flex-wrap gap-y-3 justify-between w-full'>
                          {HOURS_MAP[shiftSelected].map((hour, index) => {
                            
                            const isOccupied = isHourOccupied(
                              OCCUPIED_HOURS_FROM_ROOM, 
                              hour.startHour, 
                              hour.endHour
                            );

                            return (
                              <Button.ShiftHour
                                { ...hour }
                                selected={hour.startHour === hourSelected?.startHour}
                                key={index}
                                unvailable={isOccupied}
                                onTouch={() => {
                                  if (isOccupied) return;
                                  if (hourSelected?.startHour === hour.startHour) {
                                    setHourSelected(null);
                                    return;
                                  } 
                                  setHourSelected({
                                    startHour : hour.startHour,
                                    endHour   : hour.endHour,
                                  }
                                )}}
                              />
                          )})}
                        </View>
                  
                        { hourSelected &&
                          <>
                            <View className='h-0.5 w-fill bg-gray-200'/>
                            
                            <Label___Value
                              label='Valor por hora'
                              boldLabel
                              value={{ 
                                _     : priceFormat(prices.perHour),
                                color : 'text-green-600',
                              }}
                            />                          
                          </>
                        }
                      </>
                    }
                  </Section>
                  
                  { (hourSelected && hourSelected.startHour !== '') &&          
                    <Button.Default
                      label='Reservar sala'
                      onTouch={() => setWizardStep(2)}
                      filled
                      icon={{ name: 'key_card' }}
                    />
                  }
                </>
              ) : allocationType === '3X_WEEK' ? (
                <>
                  <Section title='SELECIONE OS DIAS (3X)'>
                    <View className='flex-row gap-1'>
                      {DAYS.map((day) => {
                        
                        const isSelected = daysSelected.includes(day);
                        const isOccupied = OCCUPIED_DAYS_FROM_ROOM.includes(day);

                        return (
                          <Button.Default
                            key={day}
                            label={TRANSLATED_DAYS_MAP[day].slice(0,3)}
                            filled={isSelected}
                            onTouch={() => handleDayPress(day)}       
                            disable={isOccupied}
                            textLineThrough={isOccupied}
                            customStyle={{ container: 'flex-1', text: 'text-sm' }}
                          />
                      )})}
                    </View>
                    
                    { daysSelected.length === 3 &&        
                      <>
                        <View className='h-0.5 w-fill bg-gray-200'/>

                        <Label___Value
                          label='Valor semanal'
                          boldLabel
                          value={{ 
                            _     : priceFormat(prices._3xWeek),
                            color : 'text-green-600',
                          }}
                        />  
                      </>
                    }
                  </Section>
                  
                  { daysSelected.length === 3 &&
                    <Button.Default
                      label='Reservar sala'
                      onTouch={() => setWizardStep(2)}
                      filled
                      icon={{ name: 'key_card' }}
                    />
                  }
                </>
              ) : allocationType === 'MONTH' ? (
                <>
                  <Section title='Resumo'>
                    <Label___Value
                      separationRow
                      label='Período'
                      value={{ _: '1 mês'}}
                    />  

                    <Label___Value
                      label='Valor mensal'
                      boldLabel
                      value={{ 
                        _     : priceFormat(prices.month),
                        color : 'text-green-600',
                      }}
                    />  
                  </Section>

                  <Button.Default
                    label='Reservar sala'
                    onTouch={() => setWizardStep(2)}
                    filled
                    icon={{ name: 'key_card' }}
                  />
                </>
              ) : (
                <View className='flex-row gap-1 items-center self-center'>
                  <MaterialIcons 
                    name="error-outline" 
                    size={18} 
                    color={systemColors.primary} 
                    className='mt-1'
                  />
                  
                  <Text className='text-medroom-primary mt-1 font-nunito-bold'>
                    Selecione um tipo de alocação
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Section title='Resumo'>
                <Label___Value
                  separationRow
                  label='Sala'
                  value={{ _: title.split('-')[0]}}
                />  

                { allocationType !== 'MONTH' &&
                  <>
                    <Label___Value
                      separationRow
                      label={ allocationType === 'PER_HOUR' 
                        ? 'Horários' 
                        : 'Dias'
                      }
                      value={{ _: 
                        allocationType === 'PER_HOUR' 
                        ?   hourSelected?.startHour 
                          + ' às ' 
                          + hourSelected?.endHour 
                        :   TRANSLATED_DAYS_MAP[daysSelected.at(0)!].split('-')[0]  
                          + ', ' 
                          + TRANSLATED_DAYS_MAP[daysSelected.at(1)!].split('-')[0] 
                          + ' e ' 
                          + TRANSLATED_DAYS_MAP[daysSelected.at(2)!].split('-')[0]
                      }}
                    />  

                    { allocationType !== '3X_WEEK' &&
                      <>          
                        <Label___Value
                          separationRow
                          label='Entrada'
                          value={{ _: hourSelected?.startHour }}
                        />

                        <Label___Value
                          separationRow
                          label='Saída'
                          value={{ _: hourSelected?.endHour }}
                        />     
                      </>
                    }
                  </>
                }

                <Label___Value
                  separationRow
                  label={ allocationType === 'MONTH' 
                    ? 'Duração' 
                    : 'Sessão' 
                  }
                  value={{ _: allocationType === 'MONTH' 
                    ? '1 mês' 
                    : '1 hora' 
                  }}
                /> 

                <Label___Value
                  label='Total'
                  boldLabel
                  value={{ 
                    color: 'text-green-600',
                    _: allocationType === 'MONTH' 
                      ? priceFormat(prices.month) 
                    : allocationType === '3X_WEEK' 
                      ? priceFormat(prices._3xWeek) 
                    :  priceFormat(prices.perHour), 
                  }}
                />     
              </Section>

              <Section title='Forma de pagamento'>
                <Button.Default
                  label='Cartão de crédito'
                  icon={{ name: 'credit_card' }}
                  filled={paymentMethod === 'CREDIT_CARD'}
                  onTouch={() => setPaymentMethod(paymentMethod === 'CREDIT_CARD' ? null : 'CREDIT_CARD')}
                />

                <Button.Default
                  label='Pix'
                  icon={{ name: 'pix' }}
                  filled={paymentMethod === 'PIX'}
                  onTouch={() => setPaymentMethod(paymentMethod === 'PIX' ? null : 'PIX')}
                />

                <Button.Default
                  label='Boleto bancário'
                  icon={{ name: 'money' }}
                  filled={paymentMethod === 'BANK_SLIP'}
                  onTouch={() => setPaymentMethod(paymentMethod === 'BANK_SLIP' ? null : 'BANK_SLIP')}
                />
              </Section>

              { paymentMethod &&
                <Button.Default
                  label='Confirmar pagamento'
                  onTouch={() => setWizardStep(3)}
                  icon={{ name: 'cash' }}
                  filled
                />
              }
            </>
          )}
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default roomRentalWizard