import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { useAuth } from '@/contexts/auth.context'
import { NewPatientFormData, newPatientSchema } from '@/schemas/newPatient.schema'
import { createPatientWithAuth } from '@/services/patients'
import { formatPhone } from '@/utils/formatPhone'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather';
import { systemColors } from '@/constants/misc/systemColors.misc'

const NewPatient = (): React.JSX.Element => {

  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control, 
    handleSubmit, 
    formState: { errors }
  } = useForm<NewPatientFormData>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: { 
      email        : '', 
      name         : '',
      observations : '',
      phone        : '',
      initialDate  : '',
    }
  }); 

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
      goBack={() => router.back()} 
      >
        <ScrollView contentContainerClassName='flex-1 py-6 gap-5 justify-center'>
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
                    maxLength={16}
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
                  <Input.DateTime
                    label="Data de Início"
                    placeholder={{ text: 'Selecione a data' }}
                    icon={{ name: 'schedule' }}
                    value={value} 
                    onChange={(selectedDate) => {
                      const dateString = selectedDate ? selectedDate.toISOString() : '';
                      onChange(dateString); 
                    }}
                  />
                )}
              />

              {errors.initialDate?.message && <Input.Error error={errors.initialDate.message as string}/> }
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
                    label='Observações'
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
              label='Salvar pasciente'
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