import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import AvailbilityTag from '@/components/ui/AvailbilityTag'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { DAYS } from '@/constants/misc/days.misc'
import { TRANSLATED_DAYS_MAP } from '@/constants/maps/translatedDays.map'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { useAuth } from '@/contexts/auth.context'
import { ApiError } from '@/services/api'
import { fetchRoomOccupancy, RoomOccupancyResponse } from '@/services/rooms'
import { Allocation } from '@/types/allocation.type'
import { Days } from '@/types/days.type'
import { RoomDisplayCard } from '@/types/room.type'
import { formatSessionDate } from '@/utils/formatSessionDate'
import { priceFormat } from '@/utils/priceFormat'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

const roomRentalWizard = (): React.JSX.Element => {
  const params = useLocalSearchParams()
  const router = useRouter()
  const auth = useAuth()

  const [allocationType, setAllocationType] = useState<Allocation | null>(null)
  const [wizardStep, setWizardStep] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [daysSelected, setDaysSelected] = useState<Days[]>([])
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
    : { perHour: 0, _3xWeek: 0, month: 0 }

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

  const dailyMarkedDates = useMemo(() => {
    const marked: Record<string, any> = {}

    const occupiedDates = Array.isArray(roomOccupancy.occupiedDays) ? roomOccupancy.occupiedDays : []
    for (const date of occupiedDates) {
      if (date < todayKey) {
        continue
      }

      marked[date] = {
        marked: true,
        dotColor: systemColors.primary,
        selectedColor: systemColors.primary,
        disableTouchEvent: true,
      }
    }

    return marked
  }, [roomOccupancy.occupiedDays, todayKey])

  const handleDayPress = (day: Days): void => {
    setDaysSelected((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day)
      }

      if (prev.length >= 3) {
        return [...prev.slice(1), day]
      }

      return [...prev, day]
    })
  }

  const handleSwitchAllocationDataClean = (): void => {
    setPaymentMethod(null)
    setDaysSelected([])
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
          days: JSON.stringify(daysSelected),
          pricePaid: allocationType === '3X_WEEK'
            ? prices._3xWeek
            : allocationType === 'MONTH'
              ? prices.month
              : prices.perHour,
          ...(paymentMethod ? { paymentMethod } : {}),
        },
      })
    }
  }, [wizardStep, router, roomId, title, allocationType, selectedDate, daysSelected, prices, paymentMethod])

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
                  filled={allocationType === '3X_WEEK'}
                  customStyle={{ container: 'flex-1 py-[7px]', text: 'text-sm' }}
                  onTouch={() => {
                    setAllocationType(allocationType === '3X_WEEK' ? null : '3X_WEEK')
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
                    <Input.DateTime
                      label='Data'
                      placeholder={{ text: 'Selecione o dia' }}
                      icon={{ name: 'schedule' }}
                      value={selectedDate ?? undefined}
                      minDate={todayKey}
                      markedDates={dailyMarkedDates}
                      onChange={(date) => {
                        if (!date) {
                          setSelectedDate(null)
                          return
                        }

                        setSelectedDate(date)
                      }}
                    />

                    {selectedDate && (
                      <>
                        <View className='h-0.5 w-fill bg-gray-200' />
                        <Label___Value
                          label='Valor diário'
                          boldLabel
                          value={{ _: priceFormat(prices.perHour), color: 'text-green-600' }}
                        />
                      </>
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
              ) : allocationType === '3X_WEEK' ? (
                <>
                  <Section title='SELECIONE OS DIAS DA SEMANA'>
                    <View className='flex-row gap-1'>
                      {DAYS.map((day) => {
                        const isSelected = daysSelected.includes(day)
                        const isOccupied = roomOccupancy.occupiedDays.includes(day)

                        return (
                          <Button.Default
                            key={day}
                            label={TRANSLATED_DAYS_MAP[day].slice(0, 3)}
                            filled={isSelected}
                            onTouch={() => handleDayPress(day)}
                            disable={isOccupied}
                            textLineThrough={isOccupied}
                            customStyle={{ container: 'flex-1', text: 'text-sm' }}
                          />
                        )
                      })}
                    </View>

                    {daysSelected.length === 3 && (
                      <>
                        <View className='h-0.5 w-fill bg-gray-200' />
                        <Label___Value
                          label='Valor semanal'
                          boldLabel
                          value={{ _: priceFormat(prices._3xWeek), color: 'text-green-600' }}
                        />
                      </>
                    )}
                  </Section>

                  {daysSelected.length === 3 && (
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
                  <Section title='Resumo'>
                    <Label___Value separationRow label='Período' value={{ _: '1 mês' }} />
                    <Label___Value
                      label='Valor mensal'
                      boldLabel
                      value={{ _: priceFormat(prices.month), color: 'text-green-600' }}
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
                      label={allocationType === 'DAILY' ? 'Dia' : 'Dias'}
                      value={{
                        _: allocationType === 'DAILY'
                          ? (selectedDate ? formatSessionDate(selectedDate.toISOString()) : '-')
                          : `${TRANSLATED_DAYS_MAP[daysSelected.at(0)!].split('-')[0]}, ${TRANSLATED_DAYS_MAP[daysSelected.at(1)!].split('-')[0]} e ${TRANSLATED_DAYS_MAP[daysSelected.at(2)!].split('-')[0]}`,
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
                      : allocationType === '3X_WEEK'
                        ? priceFormat(prices._3xWeek)
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
