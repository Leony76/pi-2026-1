import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, View } from 'react-native'
import { Select } from '@/components/select'
import { formatPhone } from '@/utils/formatPhone'
import { formatCrmCrp } from '@/utils/formatCrmCrp'
import { ProfileEditFormData, profileEditSchema } from '@/schemas/profileEdit.schema'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth.context'
import { useLoggedUserData } from '@/contexts/LoggedUserData.context'
import { updateCurrentUserWithAuth } from '@/services/auth'
import { ApiError } from '@/services/api'

const Edit = (): React.JSX.Element => {

  const router = useRouter();
  const { profile, refreshProfile } = useLoggedUserData();
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control, 
    handleSubmit, 
    reset,
    formState: { errors }
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: { 
      email     : '', 
      name      : '',
      phone     : '',
      crmCrp    : '',
      specialty : '',
    }
  }); 

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      name: profile.name,
      specialty: profile.specialty,
      crmCrp: profile.crmCrp,
      email: profile.email,
      phone: profile.phone ?? '',
    });
  }, [profile, reset]);

  const handleSaveNewProfileData = async( data: ProfileEditFormData ): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    if (!auth.token || !auth.refreshToken) {
      router.push({
        pathname: '/(authenticated)/(professional)/profile',
        params: {
          message: 'Sessão inválida. Entre novamente para salvar seus dados.'
        },
      });

      return;
    }

    try {
      setIsSubmitting(true);

      await updateCurrentUserWithAuth(data, {
        token: auth.token,
        refreshToken: auth.refreshToken,
        updateTokens: auth.updateTokens,
        signOut: auth.signOut,
      });
      await refreshProfile();

      router.push({
        pathname: '/(authenticated)/(professional)/profile',
        params: {
          message: 'Dados alterados com sucesso!'
        },
      })
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Não foi possível salvar os dados.';

      router.push({
        pathname: '/(authenticated)/(professional)/profile',
        params: {
          message,
        },
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Dados pessoais'
      description='Atualize suas informações'
      tab='PATIENTS'
      layoutType={profile?.accountType ?? 'PROFESSIONAL'}   
      goBack={() => router.push('/(authenticated)/(professional)/profile')} 
      >
        <ScrollView contentContainerClassName='py-6 gap-5 justify-center'>
          <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>
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
                    placeholder={{ text: 'Insira seu nome'}}
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
                name='specialty'
                render={({ field: { onChange, onBlur, value } }) => (
                  <Select.Style2
                    icon={{ name: 'suitcase' }}
                    optionsMap='SPECIALTY'
                    label='Especialidade'
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                )}
              />

               {errors.specialty?.message && <Input.Error error={errors.specialty.message as string}/> }
            </View>

            <View>
              <Controller
                control={control}
                name='crmCrp'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'paper_roll' }}
                    maxLength={9}
                    label='CRM / CRP'
                    onChange={(crpCrp) => {
                      const crmCrpMask = formatCrmCrp(crpCrp);
                      onChange(crmCrpMask);
                    }}
                    placeholder={{ text: '12345-SP'}}
                    type='TEXT'
                    onBlur={onBlur}
                    value={value ?? ''}
                    keyboardType='default'
                  />
                )}
              />

               {errors.crmCrp?.message && <Input.Error error={errors.crmCrp.message as string}/> }
            </View>
            
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input.Style2
                    icon={{ name: 'mail' }}
                    maxLength={256}
                    label='E-mail'
                    onChange={onChange}
                    placeholder={{ text: 'exemplo@gmail.com'}}
                    type='TEXT'
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
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input.Style2
                    icon={{ name: 'phone' }}
                    maxLength={14}
                    label='Telefone (opcional)'
                    onChange={(phone) => {
                      const phoneMask = formatPhone(phone);
                      onChange(phoneMask);
                    }}
                    placeholder={{ text: '(XX) XXXX-XXXX'}}
                    type='TEXT'
                    value={value ?? ''}
                    keyboardType='number-pad'
                  />
                )}
              />

              {errors.phone?.message && <Input.Error error={errors.phone.message as string}/> }
            </View>

            <Button.Default
              customStyle={{ container: 'mt-3' }}
              filled
              disable={isSubmitting}
              label='Salvar alterações'
              onTouch={handleSubmit(handleSaveNewProfileData)}
              icon={{ name: 'edit', size: { height: 18, width: 18 } }}
            />
          </View>
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Edit