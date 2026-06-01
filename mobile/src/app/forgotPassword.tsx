import { Input } from '@/components/input';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { ErrorModal } from '@/components/modal';
import Icon from '@/components/ui/Icon';
import { ForgotPassowordEmailFormData, forgotPassowordEmailSchema } from '@/schemas/forgotPassowordEmail.schema';
import { ApiError } from '@/services/api';
import { AuthService } from '@/services/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import { Button } from '@/components/button';

const ForgotPassword = (): React.JSX.Element => {
  const { 
    control, 
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ForgotPassowordEmailFormData>({
    mode: 'onSubmit', 
    reValidateMode: 'onChange',
    shouldUnregister: false,
    resolver: zodResolver(forgotPassowordEmailSchema),
    defaultValues: { email : '' } 
  });

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const emailValue = watch('email');

  const handleNextStep = async (data: ForgotPassowordEmailFormData) => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setShowErrorModal(false);

      await AuthService.requestPasswordReset(data.email);

      router.push({
        pathname: '/verifyResetCode',
        params: { email: data.email },
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível enviar o código de recuperação. Tente novamente.';

      setSubmitError(message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutWrapper>
      <ErrorModal
        visible={showErrorModal}
        title="Erro na recuperação"
        message={submitError || 'Ocorreu um erro. Tente novamente.'}
        onClose={() => setShowErrorModal(false)}
      />

      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }} 
      >   
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
            Para recuperar sua senha, informe o seu e-mail de cadastro
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
            disable={!emailValue || !!errors.email || isSubmitting}
            onTouch={handleSubmit(handleNextStep)}
            label={isSubmitting ? "Enviando..." : "Enviar"}
            loading={isSubmitting}
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
      </KeyboardAvoidingView>
    </LayoutWrapper>
  );
}

export default ForgotPassword