import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { Select } from '@/components/select'
import WizardProgress from '@/components/ui/WizardProgress'
import { FLOORS_MAP } from '@/constants/maps/floors.map'
import { ROOM_CHARACTERISTCS_MAP } from '@/constants/maps/roomCharacteristics.map'
import { NewRoomFormData, newRoomSchema } from '@/schemas/newRoom.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, View } from 'react-native'

const NewRoomWizard = (): React.JSX.Element => {

  const {
    control, 
    handleSubmit, 
    trigger,
    formState: { errors }
  } = useForm<NewRoomFormData>({
    resolver: zodResolver(newRoomSchema),
    mode: 'onChange',
    reValidateMode: 'onChange', 
    defaultValues: { 
      roomName        : '',
      floor           : '',
      area            : '',
      characteristics : '',
      pricePerHour    : '',
      price_3xWeek    : '',
      pricePerMonth   : '',
    }
  }); 

  const [wizardStep, setWizardStep] = useState<number>(1);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof NewRoomFormData)[] = [];

    if (wizardStep === 1) {
      fieldsToValidate = ['roomName', 'floor', 'area', 'characteristics'];
    } else if (wizardStep === 2) {
      fieldsToValidate = ['pricePerHour', 'price_3xWeek', 'pricePerMonth'];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setWizardStep(prev => prev + 1);
    }
  };

  const handleSaveNewRoom = async( data: NewRoomFormData ): Promise<void> => {
    console.log(data);

    router.push({
      pathname: '/(authenticated)/(professional)/patients',
      params: {
        message: 'Paciente cadastrado com sucesso!'
      },
    })
  };

  const DESCRIPTION_INFOS_BY_WIZARD_STEP_MAP: Record<number, string> = {
    1: 'Dados básicos',
    2: 'Preços',
    3: 'Mobiliário',
  };

  switch (wizardStep) {
    case 1:
      return (
        <LayoutWrapper>
          <SystemLayout 
          title='Nova sala' 
          description={`Etapa ${wizardStep} de 3 - ${DESCRIPTION_INFOS_BY_WIZARD_STEP_MAP[wizardStep]}`} 
          layoutType={'ENTERPRISE'}      
          tab='ROOMS'
          goBack={wizardStep > 1 ? () => setWizardStep(prev => prev - 1) : () => router.back()}
          > 
            <ScrollView contentContainerClassName='gap-5 flex-1 py-6'>
              <View className='py-3'>
                <WizardProgress currentWizardStep={wizardStep} />
              </View>
              
              <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>
                <View>
                  <Controller
                    control={control}
                    name='roomName'
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Input.Style2
                        icon={{ name: 'tag' }}
                        maxLength={256}
                        label='Nome da sala'
                        onChange={onChange}
                        placeholder={{ text: 'Sala X'}}
                        type='TEXT'
                        onBlur={onBlur}
                        value={value}
                        keyboardType='default'
                      />
                    )}
                  />
    
                  {errors.roomName?.message && <Input.Error error={errors.roomName.message as string}/> }
                </View>
    
                <View>
                  <Controller
                    control={control}
                    name='floor'
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Select.Style2
                      icon={{ name: 'stairs', size: { width: 22, height: 22 } }}
                      label='Andar'
                      onChange={onChange}
                      onBlur={onBlur}
                      optionsMap='FLOORS'
                      value={FLOORS_MAP[value]}
                      />
                    )}
                  />
    
                  {errors.floor?.message && <Input.Error error={errors.floor.message as string}/> }
                </View>   
    
                <View>
                  <Controller
                    control={control}
                    name='area'
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Input.Style2
                        icon={{ name: 'rule', size: { height: 24, width: 24 } }}
                        maxLength={2}
                        label='Área'
                        onChange={onChange}
                        placeholder={{ text: 'XXm²'}}
                        type='TEXT'
                        onBlur={onBlur}
                        value={value}
                        keyboardType='number-pad'
                      />
                    )}
                  />
    
                  {errors.area?.message && <Input.Error error={errors.area.message as string}/> }
                </View>
    
                <View>
                  <Controller
                    control={control}
                    name='characteristics'
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Select.Style2
                        icon={{ name: 'description' }}
                        label='Características'
                        onChange={onChange}
                        onBlur={onBlur}
                        optionsMap='CHARACTERISTCS'
                        value={ROOM_CHARACTERISTCS_MAP[value] }
                      />
                    )}
                  />
    
                  {errors.characteristics?.message && <Input.Error error={errors.characteristics.message as string}/> }
                </View>                
    
                <Button.Default
                  customStyle={{ container: 'mt-3' }}
                  filled
                  disable={Object.keys(errors).length > 0}
                  icon={{ name: 'right_arrow', size: { width: 20, height: 20 } }}
                  label='Próximo'
                  onTouch={handleNextStep}
                />
              </View>
            </ScrollView>
          </SystemLayout>
        </LayoutWrapper>
      )
    case 2:
      return (
        <LayoutWrapper>
          <SystemLayout 
          title='Nova sala' 
          description={`Etapa ${wizardStep} de 3 - ${DESCRIPTION_INFOS_BY_WIZARD_STEP_MAP[wizardStep]}`} 
          layoutType={'ENTERPRISE'}      
          tab='ROOMS'
          goBack={wizardStep > 1 ? () => setWizardStep(prev => prev - 1) : () => router.back()}
          > 
            <ScrollView contentContainerClassName='gap-5 flex-1 py-6'>
              <View className='py-3'>
                <WizardProgress currentWizardStep={wizardStep} />
              </View>
              

            </ScrollView>
          </SystemLayout>
        </LayoutWrapper>
      )
    default:
      return (
        <LayoutWrapper>
          <SystemLayout 
          title='Nova sala' 
          description={`Etapa ${wizardStep} de 3 - ${DESCRIPTION_INFOS_BY_WIZARD_STEP_MAP[wizardStep]}`} 
          layoutType={'ENTERPRISE'}      
          tab='ROOMS'
          goBack={wizardStep > 1 ? () => setWizardStep(prev => prev - 1) : () => router.back()}
          > 
            <ScrollView contentContainerClassName='gap-5 flex-1 py-6'>
              <View className='py-3'>
                <WizardProgress currentWizardStep={wizardStep} />
              </View>
              
              <Button.Default
                customStyle={{ container: 'mt-3' }}
                filled
                icon={{ name: 'right_arrow', size: { width: 20, height: 20 } }}
                label='Próximo'
                onTouch={handleSubmit(handleSaveNewRoom)}
              />
            </ScrollView>
          </SystemLayout>
        </LayoutWrapper>
      )
  }
}

export default NewRoomWizard;