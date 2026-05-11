import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { Select } from '@/components/select'
import Icon from '@/components/ui/Icon'
import Section from '@/components/ui/Section'
import WizardProgress from '@/components/ui/WizardProgress'
import { FLOORS_MAP } from '@/constants/maps/floors.map'
import { ROOM_CHARACTERISTCS_MAP } from '@/constants/maps/roomCharacteristics.map'
import { ROOM_ITEMS } from '@/constants/maps/roomItems.map'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { NewRoomFormData, NewRoomFormInput, newRoomSchema } from '@/schemas/newRoom.schema'
import { ROOM_ITEMS_LIMIT_MAP } from '@/types/roomItems.type'
import { createRoomWithAuth } from '@/services/rooms'
import { useAuth } from '@/contexts/auth.context'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import type { IconName } from 'root/assets/icons'
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ImageExpanded from '@/components/modal/ImageExpanded'

const NewRoomWizard = (): React.JSX.Element => {

  const {
    control, 
    handleSubmit, 
    trigger,
    setValue,
    formState: { errors, isValid }
  } = useForm<NewRoomFormInput, any, NewRoomFormData>({
    resolver: zodResolver(newRoomSchema),
    mode: 'onChange',
    reValidateMode: 'onChange', 
    defaultValues: { 
      roomName        : '',
      floor           : '',
      area            : '',
      characteristics : '',
      pricePerHour    : '',
      priceWeek       : '',
      pricePerMonth   : '',
      items           : [],
    }
  }); 

  const auth = useAuth();

  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isSavingRoom, setIsSavingRoom] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [roomImageMissingError, setRoomImageMissingError] = useState<string | null>(null);
  const [rooImageExpanded, setRoomImageExpanded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [persistDataOnInput, setPersistDataOnInput] = useState({
    roomName: '',
    floor: '',
    area: '',
  });

  const [customItemInput, setCustomItemInput] = useState<string>('');
  const [customItemAlreadyIncludedError, setCustomItemAlreadyIncludedError] = useState<string | null>(null);
  const [customItems, setCustomItems] = useState<string[]>([]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof NewRoomFormData)[] = [];

    if (wizardStep === 1) {
      fieldsToValidate = ['roomName', 'floor', 'area', 'characteristics'];
    } else if (wizardStep === 2) {
      fieldsToValidate = ['pricePerHour', 'priceWeek', 'pricePerMonth'];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setWizardStep(prev => prev + 1);
    }
  };

  const handleSaveNewRoom = async( data: NewRoomFormData ): Promise<void> => {
    try {
      setIsSavingRoom(true);
      setSubmitError(null);

      if (!auth.token || !auth.refreshToken) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      const authenticated = {
        token: auth.token,
        refreshToken: auth.refreshToken,
        updateTokens: auth.updateTokens,
        signOut: auth.signOut,
      };

      await createRoomWithAuth({
        roomName: data.roomName,
        roomImage,
        floor: data.floor,
        area: data.area,
        characteristics: data.characteristics,
        pricePerHour: data.pricePerHour,
        priceWeek: data.priceWeek,
        pricePerMonth: data.pricePerMonth,
        items: data.items,
        customItems: customItems,
      }, authenticated);

      router.replace({
        pathname: '/(authenticated)/(enterprise)/rooms',
        params: {
          message: 'Sala adicionada com sucesso!'
        },
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar a sala.');
    } finally {
      setIsSavingRoom(false);
    }
  };

  const handlePickRoomImage = async (): Promise<void> => {
    try {
      setImageError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled) {
        return;
      }

      const selected = result.assets[0];

      if (!selected?.base64) {
        setImageError('Não foi possível processar a imagem. Tente outra foto.');
        return;
      }

      const mimeType = selected.mimeType ?? 'image/jpeg';
      setRoomImage(`data:${mimeType};base64,${selected.base64}`);
    } catch {
      setImageError('Não foi possível selecionar a imagem da sala.');
    }
  };

  const handleAddCustomItem = () => {
    const trimmed = customItemInput.trim();

    if (!trimmed) return;
    if (customItems.includes(trimmed)) {
      setCustomItemAlreadyIncludedError(`"${customItemInput}" já está incluído`)
      return;
    };

    setCustomItems(prev => [...prev, trimmed]);
    setCustomItemAlreadyIncludedError(null);
    setCustomItemInput('');
  };

  const handleRemoveCustomItem = (item: string) => {
    setCustomItems(prev => prev.filter(i => i !== item));
  };

  const DESCRIPTION_INFOS_BY_WIZARD_STEP_MAP: Record<number, string> = {
    1: 'Dados básicos',
    2: 'Preços',
    3: 'Mobiliário',
  };

  const step1ActiveErros = errors.roomName || errors.floor || errors.area || errors.characteristics;
  const step2ActiveErros = errors.pricePerHour || errors.pricePerMonth || errors.priceWeek;

  useEffect(() => {
    setValue('area'     , persistDataOnInput.area);
    setValue('floor'    , persistDataOnInput.floor);
    setValue('roomName' , persistDataOnInput.roomName);
  },[wizardStep]);

  useEffect(() => {
    if (roomImage) setRoomImageMissingError(null);
    if (!roomImage && Object.keys(errors).length > 0) 
      setRoomImageMissingError('A foto da sala é obrigatória');
  }, [roomImage]);

  switch (wizardStep) {
    case 1:
      return (
        <LayoutWrapper>
          
          { roomImage &&
            <ImageExpanded
              image={roomImage}
              onRequestClose={() => setRoomImageExpanded(false)}
              visible={rooImageExpanded}
            />
          }
          
          <SystemLayout 
          title='Nova sala' 
          description={`Etapa ${wizardStep} de 3 - ${DESCRIPTION_INFOS_BY_WIZARD_STEP_MAP[wizardStep]}`} 
          layoutType={'ENTERPRISE'}      
          tab='ROOMS'
          goBack={wizardStep > 1 ? () => setWizardStep(prev => prev - 1) : () => router.push('/(authenticated)/(enterprise)/rooms')}
          > 
            <ScrollView contentContainerClassName='gap-5 py-6'>
              <View className='py-3'>
                <WizardProgress currentWizardStep={wizardStep} />
              </View>
              
              <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>
                <View className='gap-3'>
                  <Text className='font-nunito-bold text-lg text-medroom-primary'>
                    Foto da sala
                  </Text>

                  {roomImage ? (
                    <TouchableOpacity
                    activeOpacity={0.67}
                    onPress={() => setRoomImageExpanded(true)}
                    className='cursor-zoom-in'
                    >
                      <Image
                        source={{ uri: roomImage }}
                        className='w-full h-48 rounded-lg'
                      />
                    </TouchableOpacity>
                  ) : (
                    <View className='bg-medroom-primaryLight justify-center items-center w-full rounded-lg h-40'>
                      <Text className='text-medroom-primary font-nunito-bold'>
                        Nenhuma foto selecionada
                      </Text>
                    </View>
                  )}

                  {roomImageMissingError && <Input.Error error={roomImageMissingError}/> }

                  <Button.Default
                    CustomIcon={() => <FontAwesome name="photo" size={22} color={systemColors.primary} />}
                    label={roomImage ? 'Trocar foto' : 'Selecionar foto'}
                    onTouch={handlePickRoomImage}
                  />

                  {roomImage && (
                    <Button.Default
                      icon={{ name: 'x_circle', size: { width: 20, height: 20 } }}
                      label='Remover foto'
                      onTouch={() => setRoomImage(null)}
                    />
                  )}

                  {imageError && <Input.Error error={imageError} />}
                </View>

                <View>
                  <Controller
                    control={control}
                    name='roomName'
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Input.Style2
                        icon={{ name: 'tag' }}
                        maxLength={256}
                        label='Nome da sala'
                        onChange={(text) => {
                          onChange(text);
                          setPersistDataOnInput(prev => ({ ...prev, roomName: text }));
                        }}
                        placeholder={{ text: 'Sala X'}}
                        type='TEXT'
                        onBlur={onBlur}
                        value={value || persistDataOnInput.roomName}
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
                      onChange={(text) => {
                        onChange(text);
                        setPersistDataOnInput(prev => ({ ...prev, floor: text }));
                      }}
                      onBlur={onBlur}
                      optionsMap='FLOORS'
                      value={FLOORS_MAP[value] || FLOORS_MAP[persistDataOnInput.floor]}
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
                        label='Área (m²)'
                        placeholder={{ text: 'XXm²'}}
                        type='TEXT'
                        onBlur={onBlur}
                        keyboardType='number-pad'
                        value={String(value) || persistDataOnInput.area}
                        onChange={(text) => {
                          onChange(text);
                          setPersistDataOnInput(prev => ({ ...prev, area: text }));
                        }}
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
                        value={ROOM_CHARACTERISTCS_MAP[value]}
                      />
                    )}
                  />
    
                  {errors.characteristics?.message && <Input.Error error={errors.characteristics.message as string}/> }
                </View>                
    
                <Button.Default
                  customStyle={{ container: 'mt-3' }}
                  filled
                  disable={!!step1ActiveErros && !roomImage}
                  icon={{ name: 'right_arrow', size: { width: 20, height: 20 } }}
                  label='Próximo'
                  onTouch={() => {
                    if (!roomImage) setRoomImageMissingError('A foto da sala é obrigatória');
                    handleNextStep();
                  }}
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
            <ScrollView contentContainerClassName='gap-5 py-6'>
              <View className='py-3'>
                <WizardProgress currentWizardStep={wizardStep} />
              </View>
              
              <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>
                <View>
                  <Controller
                    control={control}
                    name='pricePerHour'
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Input.Style2
                        icon={{ name: 'money' }}
                        maxLength={256}
                        label='Preço por dia (R$)'
                        placeholder={{ text: 'R$ XXX,XX'}}
                        type='TEXT'
                        onBlur={onBlur}
                        keyboardType='number-pad'
                        value={String(value)}
                        onChange={onChange}
                      />
                    )}
                  />
    
                  {errors.pricePerHour?.message && <Input.Error error={errors.pricePerHour.message as string}/> }
                </View>

                <View>
                  <Controller
                    control={control}
                    name='priceWeek'
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Input.Style2
                        icon={{ name: 'money' }}
                        maxLength={256}
                        label='Preço por semana (R$)'
                        placeholder={{ text: 'R$ X.XXX,XX'}}
                        type='TEXT'
                        onBlur={onBlur}
                        keyboardType='number-pad'
                        value={String(value)}
                        onChange={onChange}
                      />
                    )}
                  />
    
                  {errors.priceWeek?.message && <Input.Error error={errors.priceWeek.message as string}/> }
                </View>

                <View>
                  <Controller
                    control={control}
                    name='pricePerMonth'
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Input.Style2
                        icon={{ name: 'money' }}
                        maxLength={256}
                        label='Preço mensal (R$)'
                        placeholder={{ text: 'R$ XX.XXX,XX'}}
                        type='TEXT'
                        onBlur={onBlur}
                        keyboardType='number-pad'
                        value={String(value)}
                        onChange={onChange}
                      />
                    )}
                  />
    
                  {errors.pricePerMonth?.message && <Input.Error error={errors.pricePerMonth.message as string}/> }
                </View>  
                
                <View>
                  <Button.Default
                    customStyle={{ container: 'mt-3' }}
                    filled
                    disable={!!step2ActiveErros}
                    icon={{ name: 'right_arrow', size: { width: 20, height: 20 } }}
                    label='Próximo'
                    onTouch={handleNextStep}
                  />

                  <Button.Default
                    customStyle={{ container: 'mt-3' }}
                    icon={{ name: 'x_circle', size: { width: 20, height: 20 } }}
                    label='Cancelar operação'
                    onTouch={() => router.back()}
                  />
                </View>
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
            <ScrollView contentContainerClassName='gap-5 py-6'>
              <View className='py-3'>
                <WizardProgress currentWizardStep={wizardStep} />
              </View>
              
              <Controller
                control={control}
                name="items"
                render={({ field: { value = [], onChange } }) => {

                  const toggleItem = (itemName: string) => {
                    const exists = value.find(i => i.name === itemName);

                    if (exists) {
                      onChange(value.filter(i => i.name !== itemName));
                    } else {
                      onChange([...value, { name: itemName, quantity: 1 }]);
                    }

                    trigger('items');
                  };

                  const increase = (itemName: string) => {
                    onChange(
                      value.map(item =>
                        item.name === itemName
                          ? { ...item, quantity: item.quantity + 1 }
                          : item
                      )
                    );
                  };

                  const decrease = (itemName: string) => {
                    onChange(
                      value.map(item =>
                          item.name === itemName
                            ? { ...item, quantity: item.quantity - 1 }
                            : item
                        )
                        .filter(item => item.quantity > 0)
                    );
                  };

                  return (
                    <>
                      <Section title='Selecione os items presentes'>
                        <View className='flex-row flex-wrap justify-between gap-y-3'>
                          {ROOM_ITEMS.map((item) => {
                            const isSelected = value.some(i => i.name === item.name);

                            return (
                              <Button.RoomItem
                                key={item.name}
                                selected={isSelected}
                                name={item.name}
                                onTouch={() => toggleItem(item.name)}
                                Icon={() => 
                                  <Icon 
                                    color={isSelected ? 'white' : systemColors.primary} 
                                    name={
                                        (item.icon === 'plants_vs_zombies' && isSelected) 
                                      ? 'plants_vs_zombies' 
                                      : (item.icon === 'plants_vs_zombies' && !isSelected) 
                                      ? 'plants_vs_zombies_blue' 
                                        : item.icon
                                    } 
                                  />
                                }
                              />
                            );
                          })}
                        </View>
                      </Section>
                      
                      <View className='mt-[-14px]'>
                        {errors.items?.message && <Input.Error error={errors.items?.message} />}                     
                      </View>
                          
                      { value.length > 0 &&                  
                        <Section title='Quantidade por item'>
                          <View className='gap-3'>
                            {value.map((item, index) => {
                              const itemData = ROOM_ITEMS.find(i => i.name === item.name);
                              
                              const limit = ROOM_ITEMS_LIMIT_MAP[item.name];
                              const isAtLimit = item.quantity >= limit;

                              return (
                                <Card.QuantityByItem
                                  key={item.name}
                                  name={item.name}
                                  addLimit={isAtLimit}
                                  quantity={item.quantity}
                                  separationRow={index !== value.length - 1}
                                  Icon={() => 
                                    <Icon name={itemData?.icon as IconName === 'plants_vs_zombies' 
                                        ? 'plants_vs_zombies_blue' 
                                        : itemData?.icon as IconName
                                      } 
                                    />
                                  }
                                  onTouch={{
                                    add: () => increase(item.name),
                                    sub: () => decrease(item.name),
                                  }}
                                />
                              );
                            })}
                          </View>
                        </Section>
                      }
                    </>
                  );
                }}
              />

              <View className='gap-5'>
                <Text className='text-medroom-secondary text-lg font-nunito-bold'>
                  ADICIONAR ITEM PERSONALIZADO
                </Text>

                <View className='flex-row gap-3'>
                  <View className='flex-1'>
                    <Input.Style2
                      label=''
                      noLabel
                      icon={{ name: 'misc', size: { height: 24, width: 24 } }}
                      onChange={setCustomItemInput}
                      placeholder={{ text: 'Balança, Nebulizador...' }}
                      type='TEXT'
                      value={customItemInput}
                      maxLength={20}
                      keyboardType='default'
                    />
                  </View>

                  <TouchableOpacity 
                  onPress={handleAddCustomItem}
                  className='bg-medroom-primary px-6 rounded-xl items-center'
                  activeOpacity={0.67}
                  >
                    <Text className='text-white font-nunito-bold text-4xl'>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>

                {customItems.length > 0 ? (
                  <>
                    <View className={`gap-3 flex-wrap rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-row flex-1`}>
                      {customItems.map((item) => (
                          <View
                          key={item}
                          className='bg-cyan-50/50 gap-3 flex-row justify-center border border-medroom-primaryLight pl-6 pr-4 py-1 rounded-xl items-center'
                          >
                            <Text className='text-medroom-primary font-nunito-bold'>
                              { item }
                            </Text>

                            <TouchableOpacity 
                            onPress={() => handleRemoveCustomItem(item)}
                            className='items-center justify-center'
                            activeOpacity={0.67}
                            >
                              <AntDesign 
                                name="close" 
                                size={13} 
                                color={systemColors.primary}
                              />
                            </TouchableOpacity>
                          </View>
                      ))}
                    </View>

                    {customItemAlreadyIncludedError && (
                      <View className='mt-[-14px]'>
                        <Input.Error error={customItemAlreadyIncludedError ?? ''} /> 
                      </View>
                    )}
                  </>
                ) : (
                  <View className='justify-center items-center w-full flex-row gap-2'>
                    <Entypo name="info-with-circle" size={18} color={systemColors.primary} />

                    <Text className='text-medroom-primary font-nunito'>
                      A adição não é obrigatória
                    </Text>
                  </View>
                )}
              </View>

              <View>
                {submitError && (
                  <View className='mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3'>
                    <Text className='text-red-700 font-nunito-bold'>
                      {submitError}
                    </Text>
                  </View>
                )}

                <Button.Default
                  filled
                  disable={!isValid || isSavingRoom}
                  icon={{ name: 'room', size: { width: 22, height: 22 } }}
                  label={isSavingRoom ? 'Salvando...' : 'Salvar sala'}
                  onTouch={handleSubmit(handleSaveNewRoom)}
                />

                <Button.Default
                  customStyle={{ container: 'mt-3' }}
                  icon={{ name: 'x_circle', size: { width: 20, height: 20 } }}
                  label='Cancelar operação'
                  onTouch={() => router.back()}
                />
              </View>
            </ScrollView>
          </SystemLayout>
        </LayoutWrapper>
      )
  }
}

export default NewRoomWizard;