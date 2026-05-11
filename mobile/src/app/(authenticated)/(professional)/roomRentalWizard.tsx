import { Button } from '@/components/button'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import AvailbilityTag from '@/components/ui/AvailbilityTag'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { useAuth } from '@/contexts/auth.context'
import { ApiError } from '@/services/api'
import { fetchRoomOccupancy, RoomOccupancyResponse } from '@/services/rooms'
import { Allocation } from '@/types/allocation.type'
import { RoomDisplayCard } from '@/types/room.type'
import { formatSessionDate } from '@/utils/formatSessionDate'
import { priceFormat } from '@/utils/priceFormat'
import { MaterialIcons } from '@expo/vector-icons'
import Icon from '@/components/ui/Icon'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View, TouchableOpacity } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { formatLocalDate } from '@/utils/formatLocalDate'
import { parseLocalDate } from '@/utils/parseLocalDate'

const roomRentalWizard = (): React.JSX.Element => {
  const params = useLocalSearchParams()
  const router = useRouter()
  const auth = useAuth()

  const [allocationType, setAllocationType] = useState<Allocation | null>(null)
  const [wizardStep, setWizardStep] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'BANK_SLIP' | 'CREDIT_CARD' | null>(null)
  const [roomOccupancy, setRoomOccupancy] = useState<RoomOccupancyResponse>({
    occupiedHours: [],
    occupiedDays: [],
  })

  const title = (params.title as string) ?? '[Não fornecido]'
  const roomId = (params.roomId as string) ?? '[Não suposto a existir]'
  const isAvailable = params.isAvailable === 'true'

  const prices: RoomDisplayCard['prices'] = params.prices
    ? JSON.parse(params.prices as string)
    : { perHour: 0, _week: 0, month: 0 }

  const complementaryData: RoomDisplayCard['complementaryData'] = params.complementaryData
    ? JSON.parse(params.complementaryData as string)
    : { floor: '[Não fornecido]', area: '[Não fornecida]', additional: '[Não fornecido]' }

  useEffect(() => {
    async function loadRoomOccupancy() {
      if (!auth.token || !roomId || roomId.startsWith('[')) {
        return
      }

      try {
        const data = await fetchRoomOccupancy(roomId, auth.token)
        setRoomOccupancy(data)
      } catch (error) {
        if (error instanceof ApiError) {
          setRoomOccupancy({ occupiedHours: [], occupiedDays: [] })
        }
      }
    }

    loadRoomOccupancy()
  }, [auth.token, roomId])

  const todayKey = formatLocalDate(new Date());

  const getDateKey = (date: Date): string => formatLocalDate(date);

  const addDays = (date: Date, days: number): Date => {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + days)
    return nextDate
  }

  const getWeekRange = (referenceDate: Date): { startDate: Date; endDate: Date } => ({
    startDate: referenceDate,
    endDate: addDays(referenceDate, 6),
  })

  const selectedWeekRange = selectedDate ? getWeekRange(selectedDate) : null

  const futureOccupiedDays = useMemo(() => {
    const occupiedDates = Array.isArray(roomOccupancy.occupiedDays) ? roomOccupancy.occupiedDays : []

    return occupiedDates.filter((date) => date >= todayKey)
  }, [roomOccupancy.occupiedDays, todayKey])

  const dailyMarkedDates = useMemo(() => {
    const marked: Record<string, any> = {}

    for (const date of futureOccupiedDays) {
      const correctedDate = formatLocalDate(
        addDays(parseLocalDate(date), 1)
      );

      marked[correctedDate] = {
        marked: true,
        dotColor: '#FF6B6B',
        selectedColor: '#FF6B6B',
        disableTouchEvent: true,
      }
    }

    return marked
  }, [futureOccupiedDays])

  const weekMarkedDates = useMemo(() => {
    const marked: Record<string, any> = {}

    for (const date of futureOccupiedDays) {
      const correctedDate = formatLocalDate(
        addDays(parseLocalDate(date), 1)
      );

      marked[correctedDate] = {
        marked: true,
        dotColor: '#FF6B6B',
        disabled: true,
        disableTouchEvent: true,
      }
    }

    if (selectedWeekRange) {
      let currentDate = new Date(selectedWeekRange.startDate)

      while (currentDate <= selectedWeekRange.endDate) {
        const key = getDateKey(currentDate)
        marked[key] = {
          ...(marked[key] ?? {}),
          color: systemColors.primary,
          textColor: '#ffffff',
          startingDay: key === getDateKey(selectedWeekRange.startDate),
          endingDay: key === getDateKey(selectedWeekRange.endDate),
        }

        currentDate = addDays(currentDate, 1)
      }
    }

    return marked
  }, [futureOccupiedDays, selectedWeekRange])

  const selectedWeekLabel = selectedWeekRange
    ? `${formatSessionDate(selectedWeekRange.startDate)} - ${formatSessionDate(selectedWeekRange.endDate)}`
    : null

  const selectedWeekDays = selectedWeekRange
    ? Array.from({ length: 7 }, (_, index) => addDays(selectedWeekRange.startDate, index))
    : []

  const [displayYear, setDisplayYear] = useState<number>(new Date().getFullYear())

  const goPrevYear = () => setDisplayYear((y) => y - 1)
  const goNextYear = () => setDisplayYear((y) => y + 1)

  const selectedMonthInfo = useMemo(() => {
    if (!selectedDate) return null

    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const startKey = formatLocalDate(new Date(year, month, 1));
    const endKey = formatLocalDate(new Date(year, month + 1, 0));
    const conflicts = futureOccupiedDays.filter((d) => d >= startKey && d <= endKey)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const status = conflicts.length === 0 ? 'Disponível' : conflicts.length >= daysInMonth ? 'Indisponível' : 'Conflito parcial'

    return { status, conflicts, count: conflicts.length, daysInMonth }
  }, [selectedDate, futureOccupiedDays])

  const canProceedWithMonth = selectedMonthInfo ? selectedMonthInfo.status === 'Disponível' : false

  const handleSwitchAllocationDataClean = (): void => {
    setPaymentMethod(null)
  }

  useEffect(() => {
    if (wizardStep >= 3) {
      router.replace({
      pathname: '/(authenticated)/(professional)/roomRentalSuccess',
      params: {
        roomId,
        roomName: title.split('-')[0],
        allocationType,
        date: selectedDate ? formatLocalDate(selectedDate) : undefined,
        pricePaid: allocationType === 'WEEK'
          ? prices._week
          : allocationType === 'MONTH'
            ? prices.month
            : prices.perHour,
        ...(paymentMethod ? { paymentMethod } : {}),
      },
    })
    }
  }, [wizardStep, router, roomId, title, allocationType, selectedDate, prices, paymentMethod])

  if (!isAvailable) {
    return (
      <LayoutWrapper>
        <SystemLayout
          layoutType='PROFESSIONAL'
          tab='HOME'
          title={title}
          description={`${complementaryData.floor} - ${complementaryData.area}m² - ${complementaryData.additional}`}
          goBack={() => router.replace('/(authenticated)/(professional)/home')}
        >
          <View className='flex-1 justify-center items-center py-12'>
            <View className='w-[90%] items-center gap-5'>
              <View className='bg-gray-100 rounded-full p-3 w-28 h-28 justify-center items-center'>
                <MaterialIcons name='block' size={32} color='#6b7280' />
              </View>
              <Text className='font-nunito-bold text-2xl text-gray-800'>Sala indisponivel</Text>
              <Text className='font-nunito text-medroom-secondary text-center'>Esta sala esta marcada como indisponivel e nao pode ser reservada no momento.</Text>
              <Button.Default
                label='Voltar'
                onTouch={() => router.replace('/(authenticated)/(professional)/home')}
                filled
                customStyle={{ container: 'w-full mt-3' }}
              />
            </View>
          </View>
        </SystemLayout>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <SystemLayout
        layoutType='PROFESSIONAL'
        tab='HOME'
        title={wizardStep === 2 ? 'Pagamento' : title}
        description={wizardStep === 2
          ? 'Escolha a forma de pagamento'
          : `${complementaryData.floor} - ${complementaryData.area}m² - ${complementaryData.additional}`}
        goBack={() => {
          if (wizardStep === 1) {
            handleSwitchAllocationDataClean()
            router.replace('/(authenticated)/(professional)/home')
          } else {
            setPaymentMethod(null)
            setWizardStep(1)
          }
        }}
      >
        <ScrollView contentContainerClassName='gap-5 py-6'>
          {wizardStep === 1 ? (
            <>
              <Section title='Informações'>
                <Label___Value separationRow label='Andar' value={{ _: complementaryData.floor }} />
                <Label___Value separationRow label='Área' value={{ _: `${complementaryData.area}m²` }} />
                <Label___Value separationRow label={complementaryData.additional} value={{ _: 'Sim' }} />
                <Label___Value
                  label='Status'
                  value={{ Component: () => (
                    <AvailbilityTag tagType='AVAILIBITY' isAvailable={isAvailable} />
                  ) }}
                />
              </Section>

              <Section title='TIPOS DE ALOCAÇÃO' row>
                <Button.Default
                  label='Por dia'
                  filled={allocationType === 'DAILY'}
                  customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}
                  onTouch={() => {
                    setAllocationType(allocationType === 'DAILY' ? null : 'DAILY')
                    handleSwitchAllocationDataClean()
                  }}
                />

                <Button.Default
                  label='Por semana'
                  filled={allocationType === 'WEEK'}
                  customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}
                  onTouch={() => {
                    setAllocationType(allocationType === 'WEEK' ? null : 'WEEK')
                    handleSwitchAllocationDataClean()
                  }}
                />

                <Button.Default
                  label='Por mês'
                  filled={allocationType === 'MONTH'}
                  customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}
                  onTouch={() => {
                    setAllocationType(allocationType === 'MONTH' ? null : 'MONTH')
                    handleSwitchAllocationDataClean()
                  }}
                />
              </Section>

              {allocationType === 'DAILY' ? (
                <>
                  <Section title='Selecione o dia'>
                    <View className='gap-2 rounded-xl border-2 border-medroom-primaryLight bg-cyan-50/20 p-3'>
                      <Text className='font-nunito-bold text-medroom-primary text-base'>
                        Escolha um dia
                      </Text>
                      <Text className='font-nunito text-medroom-secondary'>
                        Selecione o dia desejado no calendário.
                      </Text>
                    </View>

                    <View className='rounded-2xl border-2 border-medroom-primaryLight overflow-hidden'>
                      <Calendar
                        current={selectedDate ? formatLocalDate(selectedDate) : todayKey}
                        minDate={todayKey}
                        onDayPress={(day) => {
                          const date = parseLocalDate(day.dateString);
                          setSelectedDate(date);
                        }}
                        markedDates={{
                          ...dailyMarkedDates,
                          ...(selectedDate ? { [getDateKey(selectedDate)]: { selected: true, selectedColor: systemColors.primary, selectedTextColor: '#ffffff' } } : {}),
                        }}
                        theme={{
                          backgroundColor: '#ffffff',
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

                    <View className='gap-3 rounded-xl border-2 border-medroom-primaryLight bg-white p-3'>
                      <Text className='font-nunito-bold text-medroom-primary text-base'>Legenda</Text>

                      <View className='flex-row flex-wrap gap-2'>
                        <View className='flex-row items-center gap-2 rounded-full border border-medroom-primaryLight bg-cyan-50 px-3 py-1.5'>
                          <View className='h-3 w-3 rounded-full bg-medroom-primary' />
                          <Text className='font-nunito text-sm text-medroom-secondary'>Dia selecionado</Text>
                        </View>

                        <View className='flex-row items-center gap-2 rounded-full border border-red-300 bg-red-100 px-3 py-1.5'>
                          <View className='h-3 w-3 rounded-full bg-red-400' />
                          <Text className='font-nunito text-sm text-red-900'>Dia ocupado</Text>
                        </View>
                      </View>

                      {futureOccupiedDays.length > 0 && (
                        <View className='gap-2'>
                          <Text className='font-nunito-bold text-medroom-primary text-sm'>Dias ocupados</Text>

                          <View className='flex-row flex-wrap gap-2'>
                            {futureOccupiedDays.slice(0, 10).map((date) => {
                              const parsedDate = addDays(parseLocalDate(date), 1);

                              return (
                                <View
                                  key={date}
                                  className='rounded-full border border-red-300 bg-red-100 px-3 py-1'
                                >
                                  <Text className='text-xs font-nunito-bold text-red-900'>
                                    {parsedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                  </Text>
                                </View>
                              )
                            })}

                            {futureOccupiedDays.length > 10 && (
                              <View className='rounded-full border border-medroom-primaryLight bg-cyan-50 px-3 py-1'>
                                <Text className='text-xs font-nunito-bold text-medroom-secondary'>
                                  +{futureOccupiedDays.length - 10} dias
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </View>

                    {selectedDate && (
                      <View className='gap-3 rounded-xl border-2 border-medroom-primaryLight bg-white p-3'>
                        <Label___Value
                          label='Dia selecionado'
                          boldLabel
                          value={{ _: formatSessionDate(selectedDate), color: 'text-medroom-primary' }}
                        />
                        <Label___Value
                          label='Valor diário'
                          boldLabel
                          value={{ _: priceFormat(prices.perHour), color: 'text-green-600' }}
                        />
                      </View>
                    )}
                  </Section>

                  {selectedDate && (
                    <Button.Default
                      label='Reservar sala'
                      onTouch={() => setWizardStep(2)}
                      filled
                      icon={{ name: 'key_card' }}
                    />
                  )}
                </>
              ) : allocationType === 'WEEK' ? (
                <>
                  <Section title='Selecione a semana'>
                    <View className='gap-2 rounded-xl border-2 border-medroom-primaryLight bg-cyan-50/20 p-3'>
                      <Text className='font-nunito-bold text-medroom-primary text-base'>
                        Escolha uma data de referência
                      </Text>
                      <Text className='font-nunito text-medroom-secondary'>
                        A reserva cobre os 7 dias da semana iniciada na data escolhida.
                      </Text>
                    </View>

                    <View className='rounded-2xl border-2 border-medroom-primaryLight overflow-hidden'>
                      <Calendar
                        current={selectedDate ? formatLocalDate(selectedDate) : todayKey}
                        minDate={todayKey}
                        onDayPress={(day) => {
                          const date = parseLocalDate(day.dateString);
                          setSelectedDate(date);
                        }}
                        markedDates={weekMarkedDates}
                        markingType='period'
                        theme={{
                          backgroundColor: '#ffffff',
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

                    <View className='gap-3 rounded-xl border-2 border-medroom-primaryLight bg-white p-3'>
                      <Text className='font-nunito-bold text-medroom-primary text-base'>Legenda</Text>

                      <View className='flex-row flex-wrap gap-2'>
                        <View className='flex-row items-center gap-2 rounded-full border border-medroom-primaryLight bg-cyan-50 px-3 py-1.5'>
                          <View className='h-3 w-3 rounded-full bg-medroom-primary' />
                          <Text className='font-nunito text-sm text-medroom-secondary'>Semana selecionada</Text>
                        </View>

                        <View className='flex-row items-center gap-2 rounded-full border border-red-300 bg-red-100 px-3 py-1.5'>
                          <View className='h-3 w-3 rounded-full bg-red-400' />
                          <Text className='font-nunito text-sm text-red-900'>Dia ocupado</Text>
                        </View>
                      </View>

                      {futureOccupiedDays.length > 0 && (
                        <View className='gap-2'>
                          <Text className='font-nunito-bold text-medroom-primary text-sm'>Dias ocupados</Text>

                          <View className='flex-row flex-wrap gap-2'>
                            {futureOccupiedDays.slice(0, 10).map((date) => {
                              const parsedDate = parseLocalDate(date);

                              return (
                                <View
                                  key={date}
                                  className='rounded-full border border-red-300 bg-red-100 px-3 py-1'
                                >
                                  <Text className='text-xs font-nunito-bold text-red-900'>
                                    {parsedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                  </Text>
                                </View>
                              )
                            })}

                            {futureOccupiedDays.length > 10 && (
                              <View className='rounded-full border border-medroom-primaryLight bg-cyan-50 px-3 py-1'>
                                <Text className='text-xs font-nunito-bold text-medroom-secondary'>
                                  +{futureOccupiedDays.length - 10} dias
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </View>

                    {selectedWeekLabel && (
                      <View className='gap-3 rounded-xl border-2 border-medroom-primaryLight bg-white p-3'>
                        <Label___Value
                          label='Semana reservada'
                          boldLabel
                          value={{ _: (selectedWeekLabel), color: 'text-medroom-primary' }}
                        />
                        <View className='flex-row flex-wrap gap-2'>
                          {selectedWeekDays.map((date) => {
                            const dateKey = getDateKey(date)
                            const weekdayLabel = date.toLocaleDateString('pt-BR', { weekday: 'short' })
                            const dayNumber = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

                            return (
                              <View
                                key={dateKey}
                                className='min-w-[82px] flex-1 rounded-xl border border-medroom-primaryLight bg-cyan-50 px-2 py-2'
                              >
                                <Text className='text-[11px] uppercase tracking-wide text-medroom-secondary'>
                                  {weekdayLabel}
                                </Text>
                                <Text className='font-nunito-bold text-sm text-medroom-primary'>
                                  {dayNumber}
                                </Text>
                              </View>
                            )
                          })}
                        </View>
                        <Label___Value
                          label='Valor semanal'
                          boldLabel
                          value={{ _: priceFormat(prices._week), color: 'text-green-600' }}
                        />
                      </View>
                    )}
                  </Section>

                  {selectedDate && (
                    <Button.Default
                      label='Reservar sala'
                      onTouch={() => setWizardStep(2)}
                      filled
                      icon={{ name: 'key_card' }}
                    />
                  )}
                </>
              ) : allocationType === 'MONTH' ? (
                <>
                  <Section title='Selecione o mês'>
                    <View className='flex-row items-center justify-between'>
                      <TouchableOpacity onPress={goPrevYear} className='px-2'>
                        <MaterialIcons name='chevron-left' size={28} color={systemColors.primary} />
                      </TouchableOpacity>

                      <Text className='font-nunito-bold text-medroom-primary text-lg'>{displayYear}</Text>

                      <TouchableOpacity onPress={goNextYear} className='px-2'>
                        <MaterialIcons name='chevron-right' size={28} color={systemColors.primary} />
                      </TouchableOpacity>
                    </View>

                    <View className='gap-3 rounded-xl border-2 border-medroom-primaryLight bg-white p-4 mt-3'>
                      <Text className='font-nunito-bold text-medroom-primary text-base'>Mês de reserva</Text>

                      <View className='flex-row flex-wrap mt-3 -mx-2'>
                        {(() => {
                          const now = new Date()
                          const currentYear = now.getFullYear()
                          const currentMonth = now.getMonth()

                          const months = Array.from({ length: 12 }, (_, m) => {
                            const year = displayYear
                            const monthDate = new Date(year, m, 1)
                            const monthEnd = new Date(year, m + 1, 0)
                            const monthStartKey = formatLocalDate(monthDate);
                            const monthEndKey = formatLocalDate(monthEnd);
                            const daysInMonth = monthEnd.getDate()
                            const occupiedInMonth = futureOccupiedDays.filter((d) => d >= monthStartKey && d <= monthEndKey)
                            const occupiedCount = occupiedInMonth.length
                            const status = occupiedCount === 0 ? 'Disponível' : occupiedCount >= daysInMonth ? 'Indisponível' : 'Conflito parcial'
                            const dotColor = status === 'Disponível' ? '#10B981' : status === 'Indisponível' ? '#EF4444' : '#F59E0B'

                            const monthLabel = monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                            const isSelected = selectedDate && selectedDate.getMonth() === monthDate.getMonth() && selectedDate.getFullYear() === monthDate.getFullYear()

                            const monthDisabled = (displayYear < currentYear) || (displayYear === currentYear && m < currentMonth)

                            return { m, year: displayYear, monthDate, monthEndKey, daysInMonth, occupiedInMonth, occupiedCount, status, dotColor, monthLabel, isSelected, monthDisabled }
                          }).filter((it) => !it.monthDisabled)

                          return months.map(({ m, monthDate, occupiedCount, status, dotColor, monthLabel, isSelected }) => {
                            return (
                              <TouchableOpacity
                                key={`${displayYear}-${m}`}
                                activeOpacity={0.85}
                                onPress={() => {
                                  const newDate = new Date(monthDate)
                                  newDate.setDate(1)
                                  setSelectedDate(newDate)
                                }}
                                className={`w-1/2 px-2 mb-3`}
                              >
                                <View className={`relative rounded-xl p-4 ${isSelected ? 'border-2 border-green-500 bg-white' : 'border border-medroom-primaryLight bg-white'}`}>
                                  {isSelected && (
                                    <MaterialIcons name='check-circle' size={20} color='#10B981' className='absolute right-3 top-3' />
                                  )}
                                  <Text className={`${isSelected ? 'text-medroom-primary' : 'text-gray-800'} font-nunito-bold text-base capitalize`}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
                                  <View className='flex-row items-center gap-2 mt-3'>
                                    <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: dotColor }} />
                                    <Text className={`${isSelected ? 'text-medroom-primary' : 'text-gray-700'} text-xs opacity-80`}>{status}{occupiedCount > 0 && status === 'Conflito parcial' ? ` · ${occupiedCount} conflito${occupiedCount>1 ? 's' : ''}` : ''}</Text>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            )
                          })
                        })()}
                      </View>

                      {/* Inline details for selected month (status + conflicts) */}
                      {selectedDate && selectedMonthInfo && (() => {
                        const monthLabelSel = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                        if (selectedMonthInfo.status === 'Disponível') {
                          return (
                            <View className='gap-3 rounded-xl border-2 border-green-300 bg-green-50 p-3 mt-3'>
                              <View className='flex-row items-center gap-2'>
                                <View style={{ width: 18, height: 18, borderRadius: 18, backgroundColor: '#10B981' }} />
                                <Text className='font-nunito-bold text-green-700 flex-1'>{`${monthLabelSel.charAt(0).toUpperCase() + monthLabelSel.slice(1)} está totalmente disponível`}</Text>
                              </View>
                            </View>
                          )
                        }

                        if (selectedMonthInfo.status === 'Conflito parcial') {
                          return (
                            <View className='gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 mt-3'>
                              <View className='flex-row items-center gap-2'>
                                <MaterialIcons name='warning' size={20} color='#b45309' />
                                <Text className='font-nunito-bold text-amber-800 flex-1'>Conflito parcial em {monthLabelSel.charAt(0).toUpperCase() + monthLabelSel.slice(1)}</Text>
                              </View>
                              <Text className='font-nunito text-amber-800 text-sm'>Alguns dias já estão ocupados neste mês:</Text>
                              <View className='flex-row flex-wrap gap-2 mt-2'>
                                {selectedMonthInfo.conflicts.slice(0, 10).map((date) => {
                                  const parsedDate = addDays(parseLocalDate(date), 1);

                                  return (
                                    <View key={date} className='rounded-full border border-amber-300 bg-amber-100 px-3 py-1'>
                                      <Text className='text-xs font-nunito-bold text-amber-900'>
                                        {parsedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                      </Text>
                                    </View>
                                  )
                                })}
                                {selectedMonthInfo.conflicts.length > 10 && (
                                  <View className='rounded-full border border-amber-300 bg-amber-100 px-3 py-1'>
                                    <Text className='text-xs font-nunito-bold text-amber-900'>+{selectedMonthInfo.conflicts.length - 10} dias</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          )
                        }

                        // Indisponível
                        return (
                          <View className='gap-3 rounded-xl border-2 border-gray-300 bg-gray-100 p-3 mt-3'>
                            <View className='flex-row items-center gap-2'>
                              <MaterialIcons name='block' size={20} color='#6b7280' />
                              <Text className='font-nunito-bold text-gray-700 flex-1'>{monthLabelSel.charAt(0).toUpperCase() + monthLabelSel.slice(1)} está indisponível</Text>
                            </View>
                          </View>
                        )
                      })()}

                    </View>

                    <View className='mt-3'>
                      <Button.Default
                        label='Reservar sala'
                        onTouch={() => canProceedWithMonth && setWizardStep(2)}
                        filled
                        icon={{ name: 'key_card' }}
                        disable={!canProceedWithMonth}
                      />
                    </View>
                  </Section>
                </>
              ) : (
                <View className='flex-row gap-1 items-center self-center'>
                  <MaterialIcons
                    name='error-outline'
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
                <View className='rounded-xl bg-white p-4'>
                  <Text className='text-sm text-medroom-secondary'>Sala</Text>
                  <Text className='text-medroom-primary font-nunito-bold text-sm mt-1'>{title.split('-')[0]}</Text>

                  <View className='h-2' />

                  <Text className='text-sm text-medroom-secondary'>Tipo</Text>
                  <Text className='text-medroom-primary font-nunito-bold mt-1'>{allocationType === 'MONTH' ? 'Mensal completo' : allocationType === 'WEEK' ? 'Por semana' : 'Diário'}</Text>

                  <View className='h-2' />

                  {allocationType === 'MONTH' ? (
                    <>
                      <Text className='text-sm text-medroom-secondary'>Período</Text>
                      <Text className='text-medroom-primary font-nunito-bold mt-1'>{selectedDate ? selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '-'}</Text>
                      <View className='h-2' />
                      <Text className='text-sm text-medroom-secondary'>Início → Término</Text>
                      <Text className='text-medroom-primary font-nunito-bold mt-1'>{selectedDate ? `${formatSessionDate(selectedDate)} → ${formatSessionDate(addDays(selectedDate, 29))}` : '-'}</Text>
                    </>
                  ) : (
                    <>
                      <Text className='text-sm text-medroom-secondary'>Período</Text>
                      <Text className='text-medroom-primary font-nunito-bold mt-1'>{allocationType === 'WEEK' && selectedWeekLabel ? selectedWeekLabel : allocationType === 'DAILY' && selectedDate ? formatSessionDate(selectedDate) : '-'}</Text>
                    </>
                  )}

                  <View className='h-3' />
                  <View className='border-t border-gray-200 pt-3'>
                    <Text className='text-sm text-medroom-secondary'>Total</Text>
                    <Text className='text-green-600 font-nunito-bold text-lg mt-1'>{allocationType === 'MONTH' ? priceFormat(prices.month) : allocationType === 'WEEK' ? priceFormat(prices._week) : priceFormat(prices.perHour)}</Text>
                  </View>
                </View>
              </Section>

              <Section title='Forma de pagamento'>
                <View className='flex-col gap-3'>
                  {[
                    { key: 'CREDIT_CARD', label: 'Cartão de crédito', subtitle: 'Aprovação imediata', icon: 'credit_card' },
                    { key: 'PIX', label: 'Pix', subtitle: 'Aprovação em minutos', icon: 'pix' },
                    { key: 'BANK_SLIP', label: 'Boleto bancário', subtitle: 'Vence em 3 dias úteis', icon: 'money' },
                  ].map((opt) => {
                    const isSelected = paymentMethod === (opt.key as any)
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        activeOpacity={0.9}
                        onPress={() => setPaymentMethod(paymentMethod === (opt.key as any) ? null : (opt.key as any))}
                        className={`rounded-xl p-3 flex-row items-center justify-between ${isSelected ? 'border-2 border-medroom-primaryLight bg-white' : 'border border-medroom-primaryLight bg-white'}`}
                      >
                        <View className='flex-row items-center gap-3'>
                          <View className='h-10 w-10 rounded-md bg-medroom-primary/10 items-center justify-center flex'>
                            <Icon name={opt.icon as any} color={isSelected ? systemColors.primary : '#9CA3AF'} sizes={{ width: 20, height: 20 }} />
                          </View>
                          <View>
                            <Text className={`${isSelected ? 'text-medroom-primary' : 'text-gray-800'} font-nunito-bold`}>{opt.label}</Text>
                            <Text className={`${isSelected ? 'text-medroom-secondary' : 'text-gray-600'} text-xs`}>{opt.subtitle}</Text>
                          </View>
                        </View>

                        <View className='items-center justify-center'>
                          <View className={`h-5 w-5 rounded-full ${isSelected ? 'bg-medroom-primary border-2 border-white' : 'bg-transparent border border-gray-300'}`} />
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </Section>

              <View className='mt-3'>
                <Button.Default
                  label={`Pagar ${allocationType === 'MONTH' ? priceFormat(prices.month) : allocationType === 'WEEK' ? priceFormat(prices._week) : priceFormat(prices.perHour)}`}
                  onTouch={() => paymentMethod && setWizardStep(3)}
                  filled
                  disable={!paymentMethod}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default roomRentalWizard
