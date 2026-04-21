import { Button } from '@/components/button';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { ErrorModal } from '@/components/modal';
import Icon from '@/components/ui/Icon';
import { ApiError } from '@/services/api';
import { requestPasswordReset, verifyResetCode } from '@/services/auth';
import { formatTime } from '@/utils/formatTime';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

const VerifyResetCode = (): React.JSX.Element => {
  const params = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();

  const emailCodeInputRefs = useRef<(TextInput | null)[]>([]);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState<number>(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const email = typeof params.email === 'string' ? params.email : '';
  const isCodeComplete = code.every((digit) => digit.length > 0);

  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.slice(-1);
    setCode(newCode);

    if (text && index < 5) {
      emailCodeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      emailCodeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    if (isSubmitting || !isCodeComplete) {
      return;
    }

    if (!email) {
      setSubmitError('E-mail não informado para verificar o código.');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setShowErrorModal(false);

      const enteredCode = code.join('');
      const result = await verifyResetCode(email, enteredCode);

      router.push({
        pathname: '/newPassword',
        params: { token: result.sessionToken },
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível validar o código. Tente novamente.';

      setSubmitError(message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending || !email) {
      return;
    }

    try {
      setIsResending(true);
      setSubmitError(null);
      setShowErrorModal(false);

      await requestPasswordReset(email);
      setCode(['', '', '', '', '', '']);
      setSecondsLeft(600);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível reenviar o código. Tente novamente.';

      setSubmitError(message);
      setShowErrorModal(true);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  return (
    <LayoutWrapper>
      <ErrorModal
        visible={showErrorModal}
        title="Erro na verificação"
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
              name='send'
              sizes={{ width: 32, height: 32 }}
            />

            <Text className="text-3xl mt-2 font-bold mb-1 font-nunito text-medroom-primary">
              E-mail enviado!
            </Text>
          </View>

          <View className='flex-row flex-wrap justify-center gap-1'>
            <Text className='font-nunito text-center text-medroom-secondary'>
              Enviamos o código de verificação para
            </Text>

            <Text className='font-nunito-bold text-medroom-primary text-center'>
              {email}
            </Text>
          </View>

          <View className='border border-[#349228] bg-green-100/50 rounded-xl gap-4 p-2 flex-row items-center justify-center'>
            <Icon
              name='check'
              color='#349228'
              sizes={{ width: 32, height: 32 }}
            />

            <View>
              <Text className='font-nunito text-[#349228]'>
                Verifique sua caixa de entrada e spam.
              </Text>

              <Text className='font-nunito text-[#349228]'>
                O código expira em 10 minutos.
              </Text>
            </View>
          </View>

          <Text className='font-nunito-bold text-medroom-secondary self-center'>
            DIGITE O CÓDIGO DE 6 DÍGITOS
          </Text>

          <View className='flex-row gap-2'>
            {code.map((value, index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  emailCodeInputRefs.current[index] = el;
                }}
                value={value}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType='number-pad'
                maxLength={1}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                selectTextOnFocus
                className='flex-1 font-nunito-bold text-medroom-secondary min-w-0 border-2 rounded-xl text-center py-6 border-medroom-primary'
              />
            ))}
          </View>

          <View>
            {secondsLeft > 0 ? (
              <View className='gap-5'>
                <Text className='font-nunito text-center text-medroom-secondary'>
                  Código válido por: {formatTime(secondsLeft)}
                </Text>

                <Button.Default
                  onTouch={handleVerifyCode}
                  disable={!isCodeComplete || isSubmitting}
                  loading={isSubmitting}
                  label={isSubmitting ? 'Verificando...' : 'Verificar código'}
                  filled
                  icon={{ name: 'check' }}
                />

                <View className="flex-row gap-1 self-center">
                  <Text className="font-nunito text-medroom-secondary">
                    Não recebeu?
                  </Text>

                  <TouchableOpacity
                    className="font-nunito-bold underline font-medium text-medroom-primary"
                    activeOpacity={0.67}
                    disabled={isResending}
                    onPress={handleResendCode}
                  >
                    <Text className='underline text-medroom-primary'>
                      {isResending ? 'Reenviando...' : 'Reenviar código'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Button.Default
                onTouch={handleResendCode}
                disable={isResending}
                loading={isResending}
                label={isResending ? 'Reenviando...' : 'Reenviar código'}
                filled
                icon={{ name: 'lock_reset', size: { width: 32, height: 32 } }}
              />
            )}
          </View>

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
};

export default VerifyResetCode;
