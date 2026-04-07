import React from "react";
import { Link } from "expo-router";
import Icon from "../components/ui/Icon";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Select } from "@/components/select";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { Controller, useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from '@/schemas/register.schema';

const Register = () => {
  
  const {
    control,
    handleSubmit,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit', 
    reValidateMode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      name           : '',
      specialty      : '',
      crmCrp         : '',
      email          : '',
      password       : '',
      repeatPassword : '',
    }
  })

  const { errors } = useFormState({ control });

  const handleRegister = () => {

  }

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
            name="register"
            sizes={{ height: 32, width: 32 }}
          />

          <Text className="text-4xl font-bold mb-1 font-nunito text-medroom-primary">
            Cadastro
          </Text>
        </View>   

        <View>
          <Controller
            control={control}
            name={'name'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                label={'Nome completo'}
                type={'TEXT'}
                autoCorrect
                placeholder={{ text: 'Leon S. Kennedy' }}
                onBlur={onBlur}
                value={value}      
                onChange={onChange}
                icon={{
                  name : 'tag',
                }}
              />          
            )}
          />

          { errors.name?.message && <Input.Error error={errors.name?.message as string}/> }
        </View>

        <View>
          <Controller
            control={control}
            name={'specialty'}
            render={({ field: { onChange, onBlur } }) => (
              <Select.Style1
                icon={{ name: 'suitcase' }}
                onBlur={onBlur}
                label={'Especialidade'}
                optionsMap={'SPECIALTY'}
                onChange={onChange}
              />  
            )}
          />

          { errors.specialty?.message && <Input.Error error={errors.specialty?.message as string}/> }
        </View>   

        <View>
          <Controller
            control={control}
            name={'crmCrp'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                label={'CRM / CRP'}
                type={'TEXT'}
                autoCorrect
                placeholder={{ text: 'XXXXX-XX' }}
                onBlur={onBlur}
                value={value}      
                onChange={onChange}
                icon={{
                  name : 'paper_roll',
                }}
              />          
            )}
          />

          { errors.crmCrp?.message && <Input.Error error={errors.crmCrp?.message as string}/> }
        </View>   

        <View>
          <Controller
            control={control}
            name={'email'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                label={'E-mail'}
                type={'TEXT'}
                autoCorrect
                placeholder={{ text: 'exemplo@gmail.com' }}
                onBlur={onBlur}
                value={value}      
                onChange={onChange}
                icon={{
                  name : 'mail',
                }}
              />          
            )}
          />

          { errors.email?.message && <Input.Error error={errors.email?.message as string}/> }
        </View>

        <View>
          <Controller
            control={control}
            name={'password'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                label={'Senha'}
                type={'PASSWORD'}
                autoCorrect
                placeholder={{ text: '********' }}
                onBlur={onBlur}
                value={value}      
                onChange={onChange}
                icon={{
                  name : 'lock',
                }}
              />          
            )}
          />

          { errors.password?.message && <Input.Error error={errors.password?.message as string}/> }
        </View>   

        <View>
          <Controller
            control={control}
            name={'repeatPassword'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                label={'Repetir senha'}
                type={'PASSWORD'}
                autoCorrect
                placeholder={{ text: '********' }}
                onBlur={onBlur}
                value={value}      
                onChange={onChange}
                icon={{
                  name : 'lock',
                }}
              />          
            )}
          />

          { errors.repeatPassword?.message && <Input.Error error={errors.repeatPassword?.message as string}/> }
        </View>   

        <Button.Default
          onTouch={handleSubmit(handleRegister)}
          label="Cadastrar"
          filled
          icon={{
            name: 'register',
            size: { width: 20, height: 20 }
          }}
        />

        <View className="items-center gap-y-3">
          <View className="flex-row gap-1">
            <Text className="font-nunito text-medroom-secondary">
              Já tem uma conta ?
            </Text>

            <Link
            href={'/login'}
            className="font-nunito-bold underline font-medium text-medroom-primary"
            onPress={() => {}}
            >
              Entre!
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default Register;