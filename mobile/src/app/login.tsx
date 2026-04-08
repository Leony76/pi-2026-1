import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Icon from "../components/ui/Icon";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, loginSchema } from "@/schemas/login.schema";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { ErrorModal } from "@/components/modal";
import { ApiError } from "@/services/api";
import { loginWithEmail } from "@/services/auth";
import { useAuth } from "@/contexts/auth.context";

const Login = () => {
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

  const handleLogin = async (data: LoginFormData) => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setShowErrorModal(false);
      const result = await loginWithEmail(data);
      await signIn(result.token, result.refreshToken || '');
      router.replace('/(authenticated)/dashboard');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível fazer login. Tente novamente.';

      setSubmitError(message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
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

        <View>
          <Controller
            control={control}
            name={'password'}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input.Style1
                label={'Senha'}
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

          {errors.password?.message && <Input.Error error={errors.password.message as string}/> }
        </View>   

        <Button.Default
          onTouch={handleSubmit(handleLogin)}
          label={isSubmitting ? "Entrando..." : "Entrar"}
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

          <Text className="font-nunito-bold text-base italic text-medroom-secondary">
            ou
          </Text>

          <Link
          href={'/forgotPassword'}
          className="font-nunito-bold text-base underline text-medroom-primary"
          >
            Esqueceu sua senha?
          </Link>
        </View>
      </View>

      <ErrorModal
        visible={showErrorModal}
        title="Erro no login"
        message={submitError || 'Ocorreu um erro. Tente novamente.'}
        onClose={() => setShowErrorModal(false)}
      />
    </LayoutWrapper>
  );
}

export default Login;