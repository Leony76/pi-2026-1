import React, { useState } from "react";
import { View, Text } from "react-native";
import Icon from "../components/ui/Icon";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { NewPasswordFormData, newPasswordSchema } from "@/schemas/newPassword.schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ErrorModal } from "@/components/modal";
import { ApiError } from "@/services/api";
import { AuthService } from "@/services/auth";

const NewPassword = (): React.JSX.Element => {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

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

  const handleChangePassword = async (data: NewPasswordFormData) => {
    if (isSubmitting) {
      return;
    }

    if (!token) {
      setSubmitError('Sessão de redefinição inválida ou expirada!');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setShowErrorModal(false);

      await AuthService.resetPassword(
        token, 
        data.newPassword, 
        data.repeatNewPassword
      );

      router.replace({
        pathname: "/login",
        params: { changed: "true" }
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível alterar a senha. Tente novamente.';

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
        title="Erro ao redefinir senha"
        message={submitError || 'Ocorreu um erro. Tente novamente.'}
        onClose={() => setShowErrorModal(false)}
      />

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
          disable={isSubmitting}
          loading={isSubmitting}
          label={isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
          filled
          icon={{ name: 'lock' }}
        />
      </View>
    </LayoutWrapper>
  );
}

export default NewPassword;