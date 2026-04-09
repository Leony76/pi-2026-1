import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import Icon from "../components/ui/Icon";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Select } from "@/components/select";
import { View, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from '@/schemas/register.schema';
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { ErrorModal } from "@/components/modal";
import { ApiError } from "@/services/api";
import { registerWithEmail } from "@/services/auth";
import { useAuth } from "@/contexts/auth.context";

const Register = (): React.JSX.Element => {
 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { token, signIn } = useAuth();

  useEffect(() => {
    if (token) {
      router.replace('/(authenticated)/dashboard');
    }
  }, [token]);
  
  const {
    control,
    handleSubmit,
    formState: { errors }
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

  const handleRegister = async (data: RegisterFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setShowErrorModal(false);
      
      const result = await registerWithEmail(data);

      await signIn(result.token, result.refreshToken || '');
      
      router.replace('/(authenticated)/dashboard');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível concluir o cadastro. Tente novamente.';

      setSubmitError(message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <LayoutWrapper>
      <ErrorModal
        visible={showErrorModal}
        title="Erro no cadastro"
        message={submitError || 'Ocorreu um erro. Tente novamente.'}
        onClose={() => setShowErrorModal(false)}
      />
      
      <View className="flex-1 bg-white px-8 pt-16 pb-10 gap-5">
        <View className="items-center">
          <Icon name="medRoom_logo" sizes={{ height: 180, width: 180 }} />
        </View>

        <View className="flex-row items-center gap-3 justify-center">
          <Icon name="register" sizes={{ height: 32, width: 32 }} />
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
                maxLength={256}
                type={'TEXT'}
                autoCorrect
                placeholder={{ text: 'Insira seu nome completo' }}
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
                maxLength={9}
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
                maxLength={256}
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
                maxLength={51}
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
                maxLength={51}
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
          label={isSubmitting ? "Cadastrando..." : "Cadastrar"}
          filled
          icon={{
            name: 'register',
            size: { width: 20, height: 20 }
          }}
        />

        <View className="items-center gap-y-3">
          <View className="flex-row gap-1">
            <Text className="font-nunito text-medroom-secondary">
              Já tem uma conta?
            </Text>
            
            <Link 
            href={'/login'} 
            className="font-nunito-bold underline text-medroom-primary"
            >
              Entre!
            </Link>
          </View>
        </View>
      </View>
    </LayoutWrapper>
  );
}

export default Register;