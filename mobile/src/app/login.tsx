import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import Icon from "../components/ui/Icon";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Link, useLocalSearchParams, useRouter } from "expo-router"; 
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, loginSchema } from "@/schemas/login.schema";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { ErrorModal } from "@/components/modal";
import { ApiError } from "@/services/api";
import { AuthService } from "@/services/auth";
import { useAuth } from "@/contexts/auth.context";
import Toast from "@/components/ui/Toast"; 

const Login = (): React.JSX.Element => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { token, signIn } = useAuth();

  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      router.replace('/(authenticated)');
    }
  }, [token]);

  useEffect(() => {
    if (params.changed === "true") {
      setShowSuccessToast(true);
      router.setParams({}); 
    }
  }, [params.changed]);

  const { 
    control, 
    handleSubmit, 
    formState: { errors }
  } = useForm<LoginFormData>({
    mode: 'onSubmit', 
    reValidateMode: 'onChange',
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' } 
  });

  const handleLogin = async (data: LoginFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setShowErrorModal(false);
      
      const result = await AuthService.loginWithEmail(data);

      await signIn(result.token, result.refreshToken || '');
      
      router.replace('/(authenticated)');
    } catch (error) {
      const message = error instanceof ApiError
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
      <Toast
        message='Senha alterada com sucesso! Faça o login!' 
        visible={showSuccessToast} 
        onClose={() => setShowSuccessToast(false)}         
      />

      <ErrorModal
        visible={showErrorModal}
        title="Erro no login"
        message={submitError || 'Ocorreu um erro. Tente novamente.'}
        onClose={() => setShowErrorModal(false)}
      />

      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }} 
      >
        <ScrollView contentContainerClassName="bg-white px-8 pt-16 pb-10 gap-5">
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
                  keyboardType="default"
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
                  keyboardType="default"
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
            loading={isSubmitting}
            label={isSubmitting ? "Entrando" : "Entrar"}
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
              className="font-nunito-bold underline text-medroom-primary">
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
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutWrapper>
  );
}

export default Login;