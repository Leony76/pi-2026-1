import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { useAuth } from '@/contexts/auth.context'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import Icon from '@/components/ui/Icon'
import { ChangePasswordFormData, changePasswordSchema } from '@/schemas/changeCurrentPassword.schema'
import { UserService } from '@/services/user'
import { useLoggedUserData } from '@/contexts/LoggedUserData.context'
import { AuthHandlers } from '@/types/auth/authHandlers.type'

const ChangePassword = (): React.JSX.Element => {

  const router = useRouter();
  const { token, refreshToken, updateTokens, signOut } = useAuth();
  const { profile } = useLoggedUserData();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [passwordMismatchMessage, setPasswordMismatchMessage] = useState<string | null>(null);

  const {
    control, 
    handleSubmit, 
    formState: { errors }
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { 
      currentPassword: '',
    }
  }); 

  const handleVerifyCurrentPassword = async( data: ChangePasswordFormData ): Promise<void> => {

    try {
      setPasswordMismatchMessage(null);
      setIsSaving(true);

      if (!token || !refreshToken || !profile) throw new Error("Não autenticado");

      const authHandlers: AuthHandlers = {
        token,
        refreshToken,
        updateTokens,
        signOut,
      };

      const passwordMatch: boolean = await UserService.verifyCurrentPasswordToChange(
        data.currentPassword, 
        profile?.id,
        authHandlers
      );
      
      if (!passwordMatch) {
        setPasswordMismatchMessage('A senha fornecida não confere com a atual');
        return;
      }

      router.push({
        pathname: '/(authenticated)/(professional)/profile/newPassword',
        params: {
          verified: 'successful'
        },
      });

    } catch (error: unknown) {
      if (error instanceof Error) {

      } 
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Alterar senha'
      description='Siga os procedimentos'
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
                Insira sua senha atual para ser verificada em nossos registros
              </Text>
            </View>
          
            <View>
              <Controller
                control={control}
                name='currentPassword'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'lock' }}
                    maxLength={256}
                    label='Senha atual'
                    onChange={onChange}
                    placeholder={{ text: 'Insira sua senha atual'}}
                    type='PASSWORD'
                    onBlur={onBlur}
                    value={value}
                    keyboardType='default'
                  />
                )}
              />

              {errors.currentPassword?.message && 
              <Input.Error error={errors.currentPassword.message as string}/> 
              }
            </View>

            {passwordMismatchMessage &&
              <Input.Error error={passwordMismatchMessage}/> 
            }

            <Button.Default
              customStyle={{ container: '' }}
              filled
              loading={isSaving}
              CustomIcon={() => <Ionicons name="shield-checkmark" size={24} color="white" />}
              disable={Object.keys(errors).length > 0 || isSaving}
              label={isSaving ? 'Verificando...' : 'Verificar'}
              onTouch={handleSubmit(handleVerifyCurrentPassword)}
            />
          </View>
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default ChangePassword