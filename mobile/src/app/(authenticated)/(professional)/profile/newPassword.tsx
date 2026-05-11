import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { useAuth } from '@/contexts/auth.context'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import Icon from '@/components/ui/Icon'
import { changeProfessionalPasswordWithAuth } from '@/services/auth'
import { useLoggedUserData } from '@/contexts/LoggedUserData.context'
import { NewPasswordFormData, newPasswordSchema } from '@/schemas/newPassword.schema'

const NewPassword = (): React.JSX.Element => {

  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const params: { verified: 'successful' } = useLocalSearchParams();
  const { profile } = useLoggedUserData();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

  const {
    control, 
    handleSubmit, 
    formState: { errors }
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { 
      newPassword: '',
      repeatNewPassword: '',
    }
  }); 

  const handleChangePassword = async( data:NewPasswordFormData ): Promise<void> => {

    try {
      setIsSaving(true);

      if (!token || !refreshToken || !profile) throw new Error("Não autenticado");

      await changeProfessionalPasswordWithAuth(
        data.newPassword, 
        profile?.id,
        {
        token,
        refreshToken,
        updateTokens,
        signOut,
      });

      router.replace({
        pathname: '/(authenticated)/(professional)/profile',
        params: {
          message: 'Sucesso ao alterar a senha',
        },
      });

    } catch (error: unknown) {
      if (error instanceof Error) {
        setServerErrorMessage(error.message);
      } 
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (params.verified !== 'successful') {
      router.push('/(authenticated)/(professional)/profile');
    }
  }, [params.verified, router]);

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Nova senha'
      description='Defina a nova senha'
      tab='PROFILE'
      layoutType='PROFESSIONAL'   
      goBack={() => router.push('/(authenticated)/(professional)/profile')} 
      >
        <ScrollView contentContainerClassName='py-6 gap-5 justify-center flex-1'>
          <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>

            <View className='self-center items-center gap-3 py-3'>
              <View className='justify-center items-center bg-medroom-primary rounded-full h-24 w-24'>
                <Icon 
                  name='lock'
                  color={'white'}
                  sizes={{ height: 32, width: 32 }}
                />
              </View>

              <Text className='text-medroom-primary font-semibold text-center'>
                Insira sua nova senha
              </Text>
            </View>
          
            <View>
              <Controller
                control={control}
                name='newPassword'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'lock' }}
                    maxLength={256}
                    label='Nova senha'
                    onChange={onChange}
                    placeholder={{ text: 'Insira sua nova senha atual'}}
                    type='PASSWORD'
                    onBlur={onBlur}
                    value={value}
                    keyboardType='default'
                  />
                )}
              />

              {errors.newPassword?.message && 
              <Input.Error error={errors.newPassword.message as string}/> 
              }
            </View>

            <View>
              <Controller
                control={control}
                name='repeatNewPassword'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'lock' }}
                    maxLength={256}
                    label='Repetir nova senha'
                    onChange={onChange}
                    placeholder={{ text: 'Insira novamente sua nova senha'}}
                    type='PASSWORD'
                    onBlur={onBlur}
                    value={value}
                    keyboardType='default'
                  />
                )}
              />

              {errors.repeatNewPassword?.message && 
              <Input.Error error={errors.repeatNewPassword.message as string}/> 
              }
            </View>

            {serverErrorMessage &&
              <Input.Error error={serverErrorMessage}/> 
            }

            <Button.Default
              customStyle={{ container: 'mt-3' }}
              filled
              loading={isSaving}
              icon={{ name: 'check' }}
              disable={Object.keys(errors).length > 0 || isSaving}
              label={isSaving ? 'Alterando...' : 'Alterar senha'}
              onTouch={handleSubmit(handleChangePassword)}
            />
          </View>
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default NewPassword