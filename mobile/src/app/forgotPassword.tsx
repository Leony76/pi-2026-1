import { Input } from '@/components/input';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import Icon from '@/components/ui/Icon';
import { ForgotPassowordEmailFormData, forgotPassowordEmailSchema } from '@/schemas/forgotPassowordEmail.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react'
import { useForm, Controller } from 'react-hook-form';
import { Text, View } from 'react-native'
import { Button } from '@/components/button';

const forgotPassword = () => {
  const { 
    control, 
    formState: { errors }
  } = useForm<ForgotPassowordEmailFormData>({
    mode: 'onSubmit', 
    reValidateMode: 'onChange',
    shouldUnregister: false,
    resolver: zodResolver(forgotPassowordEmailSchema),
    defaultValues: { email : '' } 
  });

  return (
    <LayoutWrapper>
      <View className="flex-1 bg-white px-8 pt-16 pb-10 gap-5">
        <View className="items-center">
          <Icon
            name="medRoom_logo"
            sizes={{ height: 180, width: 180 }}
          />
        </View>

        <View className="flex-row items-center gap-2 justify-center">
          <Icon
            name="lock"
            sizes={{ height: 26, width: 26 }}
          />

          <Text className="text-3xl mt-2 font-bold mb-1 font-nunito text-medroom-primary">
            Recuperar senha
          </Text>
        </View>   

        <Text className='font-nunito text-medroom-secondary'>
          Para recuperar sua senha, informe o seu E-mail de cadastro
        </Text>

        <View>
          <Controller
            control={control}
            name={'email'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                maxLength={256}
                label={'E-mail'}
                type={'TEXT'}
                onBlur={onBlur}
                value={value}
                placeholder={{ text: 'exemplo@email.com' }}
                icon={{ name: 'mail' }}
                onChange={onChange}
              />
            )}
          />

          {errors.email?.message && <Input.Error error={errors.email.message as string}/> }
        </View> 

        <Button.Default
          onTouch={() => {}}
          label="Enviar"
          filled
          icon={{ name: 'send' }}
        />

        <Link
        href={'/login'}
        className="font-nunito-bold mt-2 self-center text-base underline text-medroom-primary"
        >
          Voltar ao login
        </Link>
      </View>
    </LayoutWrapper>
  );
}

export default forgotPassword