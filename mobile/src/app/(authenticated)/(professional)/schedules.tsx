import { Card } from '@/components/card'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import AvailbilityTag from '@/components/ui/AvailbilityTag'
import Icon from '@/components/ui/Icon'
import Label___Value from '@/components/ui/Label___Value'
import Section from '@/components/ui/Section'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { priceFormat } from '@/utils/priceFormat'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

const schedules = (): React.JSX.Element => {
  return (
    <LayoutWrapper>
      <SystemLayout
      title='Meus horários'
      description='Entradas, saídas, sessões'
      tab='SCHEDULES'
      layoutType='PROFESSIONAL'    
      >
        <ScrollView contentContainerClassName='py-5 gap-5'>
          <Section title='Ativo agora'>
            <View className='flex-row justify-between items-center'>
              <View>
                <Text className='font-nunito-bold text-medroom-primary text-xl'>
                  Sala 01 - Consultório
                </Text>

                <View className='flex-row items-center gap-1'>
                  <Icon
                    name='schedule'
                    sizes={{ width: 20, height: 20 }}
                    color={systemColors.secondary}
                  />

                  <Text className='text font-nunito-bold text-medroom-secondary'>
                    01/04/26
                  </Text>
                </View>
              </View>

              <View className='self-start'>
                <AvailbilityTag
                  tagType='ACTIVITY'
                  isAvailable
                />
              </View>
            </View>

            <View className='flex-row gap-2'>
              <Card.EntryAndExit
                hour='08:00'
                type='ENTRY'
                dayMonthYear='01 abr 2026'
              />

              <Card.EntryAndExit
                hour='09:00'
                type='EXIT'
                dayMonthYear='01 abr 2026'
              />         
            </View>

            <Label___Value
              label='Sessões realizadas'
              value={{ _: '1 de 1' }}
              separationRow
            />

            <Label___Value
              label='Valor'
              value={{ _: priceFormat(79.9), color: 'text-green-600' }}
              boldLabel
            />
          </Section>  

          <Section title='Histórico'>
            <View className='flex-row justify-between items-center'>
              <View>
                <Text className='font-nunito-bold text-medroom-primary text-xl'>
                  Sala 02 - Psicologia
                </Text>

                <View className='flex-row items-center gap-1'>
                  <Icon
                    name='schedule'
                    sizes={{ width: 20, height: 20 }}
                    color={systemColors.secondary}
                  />

                  <Text className='text font-nunito-bold text-medroom-secondary'>
                    3x semana - mar/2026
                  </Text>
                </View>
              </View>

              <View className='self-start'>
                <AvailbilityTag
                  tagType='ACTIVITY'
                  isAvailable={false}
                  closed
                />
              </View>
            </View>

            <View className='flex-row gap-2'>
              <Card.EntryAndExit
                hour='08:00'
                type='ENTRY'
                dayMonthYear='01 abr 2026'
              />

              <Card.EntryAndExit
                hour='17:00'
                type='EXIT'
                dayMonthYear='01 abr 2026'
              />         
            </View>

            <Label___Value
              label='Sessões realizadas'
              value={{ _: '12' }}
              separationRow
            />

            <Label___Value
              label='Valor'
              value={{ _: priceFormat(479.9), color: 'text-green-600' }}
              boldLabel
            />
          </Section>  
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default schedules