import React from "react";
import { View, Text } from "react-native";
import Icon from "../components/ui/Icon";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { NewPasswordFormData, newPasswordSchema } from "@/schemas/newPassword.schema";
import { useRouter } from "expo-router";

const NewPassword = ():React.JSX.Element => {

  const { 
    control, 
    handleSubmit, 
    formState: { errors }
  } = useForm<NewPasswordFormData>({
    mode: 'onSubmit', 
    reValidateMode: 'onChange',
    shouldUnregister: false,
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      newPassword       : '',
      repeatNewPassword : '',
    } 
  });

  const router = useRouter();

  const handleChangePassword = (data: NewPasswordFormData) => {
    console.log("Senha alterada!");
    
    router.replace({
      pathname: "/login",
      params: { changed: "true" }
    });
  };

  return (
    <LayoutWrapper>
      <View className="flex-1 bg-white px-8 pt-16 pb-10 gap-5">
        <View className="items-center">
          <Icon
            name="medRoom_logo"
            sizes={{ height: 180, width: 180 }}
          />
        </View>

        <View className="flex-row items-center gap-3 justify-center">
          <Icon
            name="lock"
            sizes={{ height: 32, width: 24 }}
          />

          <Text className="text-4xl font-bold mb-1 font-nunito text-medroom-primary">
            Nova senha
          </Text>
        </View>   

        <Text className='font-nunito text-center text-medroom-secondary'>
          Crie uma senha forte para protejer sua conta.
        </Text>

        <View>
          <Controller
            control={control}
            name={'newPassword'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                maxLength={256}
                label={'Nova senha'}
                type={'PASSWORD'}
                onBlur={onBlur}
                value={value}
                placeholder={{ text: '********' }}
                icon={{ name: 'lock' }}
                onChange={onChange}
              />
            )}
          />

          {errors.newPassword?.message && <Input.Error error={errors.newPassword.message as string}/> }
        </View> 

        <View>
          <Controller
            control={control}
            name={'repeatNewPassword'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                label={'Repetir nova senha'}
                maxLength={51}
                type={'PASSWORD'}
                onBlur={onBlur}
                value={value}
                placeholder={{ text: '********' }}
                icon={{ name: 'lock' }}
                onChange={onChange}
              />
            )}
          />

          {errors.repeatNewPassword?.message && <Input.Error error={errors.repeatNewPassword.message as string}/> }
        </View>   

        <Button.Default
          onTouch={handleSubmit(handleChangePassword)}
          label="Salvar nova senha"
          filled
          icon={{ name: 'lock' }}
        />
      </View>
    </LayoutWrapper>
  );
}

export default NewPassword;