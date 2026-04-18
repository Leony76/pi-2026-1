import { Input } from '@/components/input';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import Icon from '@/components/ui/Icon';
import { ForgotPassowordEmailFormData, forgotPassowordEmailSchema } from '@/schemas/forgotPassowordEmail.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Button } from '@/components/button';
import { formatTime } from '@/utils/formatTime';
import { useRouter } from 'expo-router';

const forgotPassword = (): React.JSX.Element => {
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

  const emailCodeInputRefs = useRef<Array<TextInput | null>>([]);
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const router = useRouter();

  const [secondsLeft, setSecondsLeft] = useState<number>(600); 

  const isCodeComplete = code.every(digit => digit.length > 0);

  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.slice(-1);
    setCode(newCode);

    if (text && index < 5) {
      emailCodeInputRefs.current[index + 1]?.focus();
    }
    
    if (index === 5 && text !== '' && newCode.every(d => d !== '')) {
      handleCheckCodeVality();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      emailCodeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    setSecondsLeft(600);
  };

  const handleCheckCodeVality = () => {
    router.push('/newPassword');
  }

  const [ step, setStep ] = useState<'PROVIDE_EMAIL' | 'PROVIDE_EMAIL_VERIFY_CODE'>('PROVIDE_EMAIL');
  const emailValue = watch('email');

  const handleNextStep = (data: ForgotPassowordEmailFormData) => {
    console.log(data);
    setStep('PROVIDE_EMAIL_VERIFY_CODE');
  };

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  if (step === 'PROVIDE_EMAIL_VERIFY_CODE') {
    return (

      <LayoutWrapper>
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
                { emailValue }
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
                  ref={(el) => {emailCodeInputRefs.current[index] = el}}
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
                    onTouch={handleCheckCodeVality}
                    disable={!isCodeComplete}
                    label="Verificar código"
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
                    onPress={handleResendCode}
                    >
                      <Text className='underline text-medroom-primary'>
                        Reenviar código
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>       
              ) : (
                <Button.Default
                  onTouch={handleResendCode}
                  label="Reenviar código"
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
    )
  }

  return (
    <LayoutWrapper>
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
            disable={!emailValue || !!errors.email}
            onTouch={handleSubmit(handleNextStep)}
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
      </KeyboardAvoidingView>
    </LayoutWrapper>
  );
}

export default forgotPassword