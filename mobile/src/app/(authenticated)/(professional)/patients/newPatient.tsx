import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { useAuth } from '@/contexts/auth.context'
import { NewPatientFormData, newPatientSchema } from '@/schemas/newPatient.schema'
import { createPatientWithAuth } from '@/services/patients'
import { fetchUserRentalsWithAuth, RoomRental } from '@/services/rooms'
import { HOURS_MAP } from '@/constants/maps/roomsHours.map'
import { isHourOccupied } from '@/utils/isHourOccuped'
import { formatPhone } from '@/utils/formatPhone'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather';
import { systemColors } from '@/constants/misc/systemColors.misc'
import { HourShift } from '@/types/hourShift.type'

const NewPatient = (): React.JSX.Element => {

  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rentals, setRentals] = useState<RoomRental[]>([]);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<HourShift | null>(null);

  const {
    control, 
    handleSubmit, 
    setValue,
    formState: { errors }
  } = useForm<NewPatientFormData>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: { 
      email        : '', 
      name         : '',
      observations : '',
      phone        : '',
      initialDate  : '',
      initialHour  : '',
    }
  }); 

  
  React.useEffect(() => {
    const loadRentals = async () => {
      if (!token || !refreshToken) return;

      try {
        const data = await fetchUserRentalsWithAuth({
          token,
          refreshToken,
          updateTokens,
          signOut,
        });

        setRentals(data);
      } catch (err) {
        console.error('Erro ao carregar reservas:', err);
        setRentals([]);
      }
    };

    loadRentals();
  }, [token, refreshToken, updateTokens, signOut]);

  const getDatesBetween = (start: Date, end: Date): string[] => {
    const dates: string[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (current <= last) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const getDateKey = (date: Date): string => date.toISOString().slice(0, 10);

  const computeMarkedDates = () => {
    const marked: Record<string, any> = {};
    const allDates = new Set<string>();
    const todayKey = getDateKey(new Date());

    for (const r of rentals) {
      try {
        const days = getDatesBetween(new Date(r.startDate), new Date(r.endDate));

        for (const d of days) {
          if (d < todayKey) {
            continue;
          }

          marked[d] = {
            marked: true,
            dotColor: systemColors.primary,
            selectedColor: systemColors.primary,
          };
          allDates.add(d);
        }
      } catch (err) {
        // ignore
      }
    }

    return { marked, allowedDates: allDates };
  };

  const { marked: markedDates, allowedDates } = computeMarkedDates();

  const selectedDateKey = selectedDateObj ? getDateKey(selectedDateObj) : '';

  const availableHours = useMemo(() => {
    if (!selectedDateObj) {
      return [] as Array<HourShift & { unavailable: boolean }>;
    }

    const occupiedHours = rentals
      .filter((r) => {
        const rentalStart = getDateKey(new Date(r.startDate));
        const rentalEnd = getDateKey(new Date(r.endDate));

        return rentalStart <= selectedDateKey && selectedDateKey <= rentalEnd;
      })
      .map(() => ({ startHour: '00:00', endHour: '23:59' } as HourShift));

    const todayKey = getDateKey(new Date());

    return (Object.values(HOURS_MAP).flat() as HourShift[]).map((hour) => {
      const isOccupied = isHourOccupied(occupiedHours, hour.startHour, hour.endHour);
      const isPassed = selectedDateKey === todayKey && (() => {
        const now = new Date();
        const [hh, mm] = hour.startHour.split(':').map((s) => parseInt(s, 10));
        const slotStart = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate(), hh, mm, 0, 0);
        return now > slotStart;
      })();

      return {
        ...hour,
        unavailable: isOccupied || isPassed,
      };
    });
  }, [rentals, selectedDateKey, selectedDateObj]);

  const getMinDate = (): string => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const handleSaveNewPatient = async( data: NewPatientFormData ): Promise<void> => {
    if (!token || !refreshToken) {
      setSubmitError('Não autenticado');
      return;
    }

    try {
      setIsSaving(true);
      setSubmitError(null);

      await createPatientWithAuth(
        {
          name: data.name,
          phone: data.phone,
          email: data.email?.trim() ? data.email : undefined,
          initialDate: data.initialDate,
          initialHour: data.initialHour,
          observations: data.observations?.trim() ? data.observations : undefined,
        },
        {
          token,
          refreshToken,
          updateTokens,
          signOut,
        }
      );

      router.push({
        pathname: '/(authenticated)/(professional)/patients',
        params: {
          message: 'Paciente cadastrado com sucesso!'
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Erro ao cadastrar paciente');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Novo paciente'
      description='Preencha os dados'
      tab='PATIENTS'
      layoutType='PROFESSIONAL'   
      goBack={() => router.push('/(authenticated)/(professional)/patients')} 
      >
        <ScrollView contentContainerClassName='flex-1 py-6 gap-5 justify-start'>
          <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>
            {submitError && (
              <Text className='text-red-500 text-center'>{submitError}</Text>
            )}

            <View>
              <Controller
                control={control}
                name='name'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'tag' }}
                    maxLength={256}
                    label='Nome completo'
                    onChange={onChange}
                    placeholder={{ text: 'Insira o nome do paciente'}}
                    type='TEXT'
                    onBlur={onBlur}
                    value={value}
                    keyboardType='default'
                  />
                )}
              />

               {errors.name?.message && <Input.Error error={errors.name.message as string}/> }
            </View>

            <View>
              <Controller
                control={control}
                name='phone'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'phone' }}
                    maxLength={16}
                    label='Telefone'
                    onChange={(text) => {
                      const phoneMask = formatPhone(text);
                      onChange(phoneMask);
                    }}
                    placeholder={{ text: '(XX) XXXXX-XXXX'}}
                    type='TEXT'
                    onBlur={onBlur}
                    value={value}
                    keyboardType='number-pad'
                  />
                )}
              />

               {errors.phone?.message && <Input.Error error={errors.phone.message as string}/> }
            </View>

            <View>
              <Controller
                control={control}
                name='email'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'mail' }}
                    maxLength={15}
                    label='E-mail (opcional)'
                    onChange={onChange}
                    placeholder={{ text: 'exemplo@gmail.com'}}
                    type='TEXT'
                    onBlur={onBlur}
                    value={value ?? ''}
                    keyboardType='default'
                  />
                )}
              />

               {errors.email?.message && <Input.Error error={errors.email.message as string}/> }
            </View>
            
            <View>
              <Controller
                control={control}
                name="initialDate"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input.DateTime
                      label="Data de Início"
                      placeholder={{ text: 'Selecione a data' }}
                      icon={{ name: 'schedule' }}
                      value={value} 
                      minDate={getMinDate()}
                      markedDates={markedDates}
                      onChange={(selectedDate) => {
                        // only allow dates with rentals
                        if (!selectedDate) {
                          onChange('');
                          setSelectedDateObj(null);
                          return;
                        }

                        const dateStr = selectedDate.toISOString().slice(0, 10);
                        if (!allowedDates.has(dateStr)) {
                          // date has no rentals, reject
                          setSubmitError('Selecione um dia que você tenha aluguel de sala');
                          return;
                        }

                        onChange(dateStr);
                        setSelectedDateObj(selectedDate);
                        setSubmitError(null);
                        setSelectedHour(null);
                        setValue('initialHour', '');
                      }}
                    />

                    {/* Horário: aparece após escolher a data */}
                    {selectedDateObj && (
                      <View className='mt-3'>
                        <Text className='font-nunito-bold text-medroom-primary mb-2'>Horário</Text>

                        <View className='flex-row flex-wrap gap-y-3 justify-between w-full mt-3'>
                          {(['MORNING', 'AFTERNOON', 'NIGHT'] as const).map((shift) => (
                            <View key={shift} className='w-full gap-2'>
                              <Text className='font-nunito-bold text-sm text-medroom-primary'>
                                {shift === 'MORNING' ? 'Manhã' : shift === 'AFTERNOON' ? 'Tarde' : 'Noite'}
                              </Text>

                              <View className='flex-row flex-wrap gap-y-3 justify-between w-full'>
                                {HOURS_MAP[shift].map((hour, index) => {
                                  const availableHour = availableHours.find((slot) => slot.startHour === hour.startHour && slot.endHour === hour.endHour);
                                  const isUnavailable = !availableHour || availableHour.unavailable;

                                  return (
                                    <Button.ShiftHour
                                      { ...hour }
                                      selected={hour.startHour === selectedHour?.startHour}
                                      key={`${shift}-${index}`}
                                      unvailable={isUnavailable}
                                      onTouch={() => {
                                        if (isUnavailable) return;

                                        if (selectedHour?.startHour === hour.startHour) {
                                          setSelectedHour(null);
                                          setValue('initialHour', '');
                                          setValue('initialDate', selectedDateObj.toISOString().slice(0, 10));
                                          return;
                                        }

                                        setSelectedHour({ startHour: hour.startHour, endHour: hour.endHour });
                                        setValue('initialHour', hour.startHour);
                                        setValue('initialDate', selectedDateObj.toISOString().slice(0, 10));
                                      }}
                                    />
                                  );
                                })}
                              </View>
                            </View>
                          ))}
                        </View>

                        {selectedHour && (
                          <Text className='mt-2 text-sm text-medroom-primary'>
                            Horário selecionado: {selectedHour.startHour} às {selectedHour.endHour}
                          </Text>
                        )}
                      </View>
                    )}
                  </>
                )}
              />

              {errors.initialDate?.message && <Input.Error error={errors.initialDate.message as string}/> }
              {errors.initialHour?.message && <Input.Error error={errors.initialHour.message as string}/> }
            </View>

            <View>
              <Controller
                control={control}
                name="observations"
                render={({ field: { onChange, value } }) => (
                  <Input.Style2
                    icon={{ name: 'lupe' }}
                    ExteriorIcon={() => <Feather name="search" size={20} color={systemColors.primary} />}
                    maxLength={256}
                    label='Observações (opcional)'
                    onChange={onChange}
                    placeholder={{ text: 'Ex: sessões semanais'}}
                    type='TEXT'
                    value={value ?? ''}
                    keyboardType='default'
                  />
                )}
              />

              {errors.observations?.message && <Input.Error error={errors.observations.message as string}/> }
            </View>

            <Button.Default
              customStyle={{ container: 'mt-3' }}
              filled
              disable={Object.keys(errors).length > 0 || isSaving}
              label='Salvar paciente'
              onTouch={handleSubmit(handleSaveNewPatient)}
              icon={{ name: 'new_person' }}
            />

            {isSaving && (
              <View className='items-center'>
                <ActivityIndicator size='small' color='#3b82f6' />
              </View>
            )}
          </View>
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default NewPatient