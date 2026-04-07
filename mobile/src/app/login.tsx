import React from "react";
import { View, Text, ScrollView, StatusBar } from "react-native";
import Icon from "../components/ui/Icon";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Link } from "expo-router";
import { useForm, Controller, useFormState } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, loginSchema } from "@/schemas/login.schema";

const Login = () => {

  const { 
    control, 
    handleSubmit, 
  } = useForm<LoginFormData>({
    mode: 'onSubmit', 
    reValidateMode: 'onChange',
    shouldUnregister: false,
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email    : '',
      password : '',
    } 
  });

  const { errors } = useFormState({ control });

  const handleLogin = (data: LoginFormData) => {
    console.log("Dados prontos para API:", data);
  };

  return (
    <ScrollView
    contentContainerStyle={{ flexGrow: 1 }}
    keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#white" />

      <View className="flex-1 bg-white px-8 pt-16 pb-10 gap-5">

        <View className="items-center">
          <Icon
            name="medRoom_logo"
            sizes={{ height: 180, width: 180 }}
          />
        </View>

        <View className="flex-row items-center gap-3 justify-center">
          <Icon
            name="signin"
            sizes={{ height: 32, width: 24 }}
          />

          <Text className="text-4xl font-bold mb-1 font-nunito text-medroom-primary">
            Entrar
          </Text>
        </View>   

        <View>
          <Controller
            control={control}
            name={'email'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
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

        <View>
          <Controller
            control={control}
            name={'password'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                label={'Senha'}
                type={'PASSWORD'}
                onBlur={onBlur}
                value={value}
                placeholder={{ text: '********' }}
                icon={{ name: 'lock' }}
                onChange={onChange}
              />
            )}
          />

          {errors.email?.message && <Input.Error error={errors.email.message as string}/> }
        </View>   

        <Button.Default
          onTouch={handleSubmit(handleLogin)}
          label="Entrar"
          filled
          icon={{ name: 'signin' }}
        />

        <View className="items-center gap-y-3">
          <View className="flex-row gap-1">
            <Text className="font-nunito text-medroom-secondary">
              Não tem uma conta?
            </Text>

            <Link
            href={'/register'}
            className="font-nunito-bold underline font-medium text-medroom-primary"
            >
              Cadastre-se!
            </Link>
          </View>

          <Text className="font-nunito-bold text-sm italic text-medroom-secondary">
            ou
          </Text>

          <Link
          href={'/forgotPassword'}
          className="font-nunito-bold text-sm underline text-medroom-primary"
          >
            Esqueceu sua senha?
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

export default Login;