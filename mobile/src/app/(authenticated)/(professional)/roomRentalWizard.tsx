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
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Calendar } from 'react-native-calendars'

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

  const todayKey = new Date().toISOString().slice(0, 10)

  const getDateKey = (date: Date): string => date.toISOString().slice(0, 10)

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
      marked[date] = {
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
      marked[date] = {
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
    ? `${formatSessionDate(selectedWeekRange.startDate.toISOString())} - ${formatSessionDate(selectedWeekRange.endDate.toISOString())}`
    : null

  const selectedWeekDays = selectedWeekRange
    ? Array.from({ length: 7 }, (_, index) => addDays(selectedWeekRange.startDate, index))
    : []

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
          date: selectedDate ? selectedDate.toISOString() : undefined,
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
                        current={selectedDate ? selectedDate.toISOString().slice(0, 10) : todayKey}
                        minDate={todayKey}
                        onDayPress={(day) => {
                          const date = new Date(day.timestamp)
                          date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
                          setSelectedDate(date)
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
                              const parsedDate = new Date(`${date}T00:00:00`)

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
                          value={{ _: formatSessionDate(selectedDate.toISOString()), color: 'text-medroom-primary' }}
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
                        current={selectedDate ? selectedDate.toISOString().slice(0, 10) : todayKey}
                        minDate={todayKey}
                        onDayPress={(day) => {
                          const date = new Date(day.timestamp)
                          date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
                          setSelectedDate(date)
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
                              const parsedDate = new Date(`${date}T00:00:00`)

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
                          value={{ _: selectedWeekLabel, color: 'text-medroom-primary' }}
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
                    <View className='gap-2 rounded-xl border-2 border-medroom-primaryLight bg-cyan-50/20 p-3'>
                      <Text className='font-nunito-bold text-medroom-primary text-base'>
                        Reserva mensal completa
                      </Text>
                      <Text className='font-nunito text-medroom-secondary'>
                        A reserva cobre 30 dias corridos a partir da data de início escolhida.
                      </Text>
                    </View>

                    <View className='gap-3 rounded-xl border-2 border-medroom-primaryLight bg-white p-4'>
                      <Text className='font-nunito-bold text-medroom-primary text-base'>Mês de reserva</Text>
                      
                      <View className='gap-3'>
                        {Array.from({ length: 6 }, (_, i) => {
                          const date = new Date()
                          date.setDate(1)
                          date.setMonth(date.getMonth() + i)
                          const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                          const isSelected = selectedDate && 
                            selectedDate.getMonth() === date.getMonth() && 
                            selectedDate.getFullYear() === date.getFullYear()
                          
                          return (
                            <Button.Default
                              key={i}
                              label={monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                              filled={isSelected}
                              onTouch={() => {
                                const newDate = new Date(date)
                                newDate.setDate(1)
                                setSelectedDate(newDate)
                              }}
                              customStyle={{ container: 'py-3', text: 'text-base capitalize' }}
                            />
                          )
                        })}
                      </View>
                    </View>

                    {selectedDate && (
                      <View className='gap-3 rounded-xl border-2 border-medroom-primaryLight bg-white p-4'>
                        <View className='gap-2'>
                          <Text className='font-nunito-bold text-medroom-primary text-sm'>Período selecionado</Text>
                          <View className='gap-1'>
                            <Label___Value
                              label='Início'
                              value={{ _: formatSessionDate(selectedDate.toISOString()), color: 'text-medroom-secondary' }}
                            />
                            <Label___Value
                              label='Fim'
                              value={{ _: formatSessionDate(addDays(selectedDate, 29).toISOString()), color: 'text-medroom-secondary' }}
                            />
                          </View>
                        </View>

                        <View className='h-0.5 w-full bg-gray-200' />

                        <View className='gap-2'>
                          <View className='flex-row items-center justify-between'>
                            <Text className='font-nunito text-medroom-secondary'>Duração</Text>
                            <Text className='font-nunito-bold text-medroom-primary'>30 dias</Text>
                          </View>
                        </View>

                        <View className='h-0.5 w-full bg-gray-200' />

                        <View className='gap-2'>
                          <Label___Value
                            label='Valor total'
                            boldLabel
                            value={{ _: priceFormat(prices.month), color: 'text-green-600' }}
                          />
                        </View>
                      </View>
                    )}

                    {futureOccupiedDays.length > 0 && (
                      <View className='gap-3 rounded-xl border-2 border-red-300 bg-red-50 p-3'>
                        <View className='flex-row items-center gap-2'>
                          <MaterialIcons name='warning' size={20} color='#dc2626' />
                          <Text className='font-nunito-bold text-red-700 flex-1'>Dias com conflito</Text>
                        </View>
                        <Text className='font-nunito text-red-700 text-sm'>
                          Existem dias ocupados no período. Verifique os seguintes dias:
                        </Text>
                        <View className='flex-row flex-wrap gap-2 mt-2'>
                          {futureOccupiedDays.slice(0, 10).map((date) => {
                            const parsedDate = new Date(`${date}T00:00:00`)
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
                            <View className='rounded-full border border-red-300 bg-red-100 px-3 py-1'>
                              <Text className='text-xs font-nunito-bold text-red-900'>
                                +{futureOccupiedDays.length - 10} dias
                              </Text>
                            </View>
                          )}
                        </View>
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
                <Label___Value separationRow label='Sala' value={{ _: title.split('-')[0] }} />

                {allocationType !== 'MONTH' && (
                  <>
                    <Label___Value
                      separationRow
                      label={allocationType === 'DAILY' ? 'Dia' : 'Semana'}
                      value={{
                        _: allocationType === 'DAILY'
                          ? (selectedDate ? formatSessionDate(selectedDate.toISOString()) : '-')
                          : (selectedDate
                            ? `${formatSessionDate(selectedDate.toISOString())} - ${formatSessionDate(new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 6)).toISOString())}`
                            : '-'),
                      }}
                    />

                    <Label___Value
                      separationRow
                      label='Sessão'
                      value={{ _: allocationType === 'DAILY' ? '1 dia' : '1 semana' }}
                    />
                  </>
                )}

                <Label___Value
                  separationRow
                  label={allocationType === 'MONTH' ? 'Duração' : 'Sessão'}
                  value={{ _: allocationType === 'MONTH' ? '1 mês' : allocationType === 'DAILY' ? '1 dia' : '1 semana' }}
                />

                <Label___Value
                  label='Total'
                  boldLabel
                  value={{
                    color: 'text-green-600',
                    _: allocationType === 'MONTH'
                      ? priceFormat(prices.month)
                      : allocationType === 'WEEK'
                        ? priceFormat(prices._week)
                        : priceFormat(prices.perHour),
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

              {paymentMethod && (
                <Button.Default
                  label='Confirmar pagamento'
                  onTouch={() => setWizardStep(3)}
                  icon={{ name: 'cash' }}
                  filled
                />
              )}
            </>
          )}
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default roomRentalWizard
