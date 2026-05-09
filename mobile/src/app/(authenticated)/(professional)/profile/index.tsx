import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import Icon from '@/components/ui/Icon'
import { systemColors } from '@/constants/misc/systemColors.misc'
import { useLoggedUserData } from '@/contexts/LoggedUserData.context'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { updateCurrentUserImageWithAuth } from '@/services/auth'
import * as ImagePicker from 'expo-image-picker'
import { priceFormat } from '@/utils/priceFormat'
import Section from '@/components/ui/Section'
import Label___Value from '@/components/ui/Label___Value'
import Entypo from '@expo/vector-icons/Entypo';
import { Button } from '@/components/button'
import { useAuth } from '@/contexts/auth.context'
import { Modal } from '@/components/modal'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import Toast from '@/components/ui/Toast'

const Profile = (): React.JSX.Element => {

  const { profile, isLoading, error, refreshProfile } = useLoggedUserData();  
  const { signOut, token, refreshToken, updateTokens } = useAuth();

  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [urlParamsMessage, setUrlParamsMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [ signOutConfirm, setSignOutConfirm ] = useState<boolean>(false);

  const router = useRouter();
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const [profileImageExpand, setProfileExpand] = useState<boolean>(false);
  
  useEffect(() => {
    if (params.message) {
      setUrlParamsMessage(params.message as string);
      setToastVisible(true);

      (navigation as any).setParams({
        message: undefined,
      });

      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url.pathname);
      }
    }
  }, [params.message]);

  const handleCloseToast = () => {
    setToastVisible(false);
    router.setParams({ message: '' });
  };

  if (isLoading) {
    return (
      <LayoutWrapper>
        <SystemLayout
          title='Perfil'
          description='Carregando seus dados'
          tab='PROFILE'
          mainPxOff
          headerHidden
          layoutType='PROFESSIONAL'
        >
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color={systemColors.primary} />
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <SystemLayout
          title='Perfil'
          description='Não foi possível carregar seus dados'
          tab='PROFILE'
          mainPxOff
          headerHidden
          layoutType='PROFESSIONAL'
        >
          <View className='flex-1 items-center justify-center px-6'>
            <Text className='text-center text-red-500 font-nunito-bold'>
              {error}
            </Text>
          </View>
        </SystemLayout>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <Modal.ImageExpanded
        image={profile?.displayImage ?? 'https://d2d7ho1ae66ldi.cloudfront.net/ArquivoNoticias/4d41e027-17d6-11ef-aa78-d602bea5d5c0/mad-max.jpg'}
        onRequestClose={() => setProfileExpand(false)}
        visible={profileImageExpand}
      />

      { signOutConfirm &&
        <Modal.ConfirmAction
          onConfirm={signOut}
          confirmMessage='Tem certeza em sair do sistema ?'
          onRequestClose={() => setSignOutConfirm(false)}
          visible={signOutConfirm}
        />
      }

      <Toast
        message={urlParamsMessage as string}
        onClose={handleCloseToast}
        visible={toastVisible}
      />

      <SystemLayout
      title='Perfil'
      description='Personalize e altere suas informações'
      tab='PROFILE'
      mainPxOff
      headerHidden
      layoutType={profile?.accountType ?? 'PROFESSIONAL'}    
      >
        <ScrollView contentContainerClassName='gap-5 pb-6'>
            <LinearGradient
          colors={[systemColors.primary, '#0B4C4E']} 
          className="justify-center items-center w-full gap-4 py-8"
          >
            <View className='relative'>
              <TouchableOpacity
              activeOpacity={0.67}
              onPress={() => setProfileExpand(true)}
              >
                <Image
                  source={{ uri: profile?.displayImage ?? 'https://d2d7ho1ae66ldi.cloudfront.net/ArquivoNoticias/4d41e027-17d6-11ef-aa78-d602bea5d5c0/mad-max.jpg' }}
                  className='w-40 h-40 rounded-full border-cyan-200'
                  style={{ borderWidth: 2 }}
                />
              </TouchableOpacity>

              {isUploadingImage && (
                <View className='mt-2'>
                  <ActivityIndicator size='small' color={systemColors.primary} />
                </View>
              )}

              {imageError && (
                <View className='mt-2 px-6'>
                  <Text className='text-red-500 font-nunito'>{imageError}</Text>
                </View>
              )}

              <TouchableOpacity 
              activeOpacity={0.67}
              className='absolute bottom-2 right-2 bg-cyan-100 p-1 rounded-full'
              onPress={async () => {
                try {
                  setImageError(null);
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    quality: 0.7,
                    base64: true,
                  });

                  if (result.canceled) return;

                  const selected = result.assets[0];

                  if (!selected?.base64) {
                    setImageError('Não foi possível processar a imagem.');
                    return;
                  }

                  const mimeType = selected.mimeType ?? 'image/jpeg';
                  const dataUrl = `data:${mimeType};base64,${selected.base64}`;

                  if (!token || !refreshToken) {
                    setImageError('Sessão inválida. Faça login novamente.');
                    return;
                  }

                  setIsUploadingImage(true);

                  await updateCurrentUserImageWithAuth(dataUrl, { token, refreshToken, updateTokens, signOut });

                  await refreshProfile();
                } catch (err: any) {
                  setImageError(err?.message ?? 'Erro ao enviar imagem');
                } finally {
                  setIsUploadingImage(false);
                }
              }}
              >
                <MaterialCommunityIcons 
                  name="pencil" 
                  size={24} 
                  color={systemColors.primary} 
                />
              </TouchableOpacity>
            </View>

            <View className='items-center'>
              <Text className='text-white text-2xl font-nunito-bold text-center'>
                Dr(a) { profile?.name ?? '[ Desconhecido ]' }
              </Text>

              <Text className='text-white text-lg font-nunito'>
                CRM {profile?.crmCrp ?? '[ Desconhecido ]'}
              </Text>
            </View>

            <View className='flex-row gap-3'>
              <View className='border rounded-xl bg-white/10 border-white py-2 px-4 flex-row gap-2'>
                <Icon
                  name='suitcase'
                  color='white'
                  sizes={{ width: 20, height: 20 }}
                />

                <Text className='text-white font-nunito'>
                  {profile?.specialtyLabel ?? 'Especialidade'}
                </Text>
              </View>

              <View className='border rounded-xl bg-white/10 border-white py-2 px-4 flex-row gap-2'>
                <Icon
                  name='check'
                  color='white'
                  sizes={{ width: 20, height: 20 }}
                />

                <Text className='text-white font-nunito'>
                  Verificado
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View className='px-6 gap-5'>
            <View className='gap-4'>
              <Text className='text-medroom-secondary text-lg font-nunito-bold'>
                INFORMAÇÕES GERAIS
              </Text>

              <View className='flex-row justify-between gap-3'>
                <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
                  <Text className='font-nunito-bold text-medroom-primary text-4xl'>
                    {profile?.stats.sessions ?? 0}
                  </Text>

                  <Text className='font-nunito-bold text-medroom-secondary'>
                    Sessões
                  </Text>
                </View>

                <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
                  <Text className='font-nunito-bold text-medroom-primary text-4xl'>
                    {profile?.stats.patients ?? 0}
                  </Text>

                  <Text className='font-nunito-bold text-medroom-secondary'>
                    Pacientes
                  </Text>
                </View>

                <View className={`justify-center items-center rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col flex-1`}>
                  <Text className='font-nunito-bold text-green-600 text-base'>
                    { priceFormat(profile?.stats.totalSpent ?? 0) }
                  </Text>

                  <Text className='font-nunito-bold text-medroom-secondary'>
                    Total gasto
                  </Text>
                </View>
              </View>
            </View>

            <Section title='Minha Conta'>
              <Label___Value
                onTouch={() => router.push('/(authenticated)/(professional)/profile/edit')}
                value={{ Component: () => <Entypo name="chevron-right" size={24} color={systemColors.primary}/> }}
                separationRow
                LabelComponent={() => (
                  <View className='flex-row gap-2 items-center ml-1'>
                    <Icon
                      name='person'
                      sizes={{ height: 20, width: 20 }}
                    />

                    <Text className='font-nunito-bold text-medroom-secondary'>
                      Dados pessoais
                    </Text>
                  </View>
                )}          
              />

              <Label___Value
                value={{ Component: () => <Entypo name="chevron-right" size={24} color={systemColors.primary}/> }}
                LabelComponent={() => (
                  <View className='flex-row gap-2 items-center ml-1'>
                    <Icon
                      name='lock'
                      sizes={{ height: 20, width: 20 }}
                    />

                    <Text className='font-nunito-bold text-medroom-secondary'>
                      Alterar senha
                    </Text>
                  </View>
                )}          
              />

            </Section>

            <Section title='Atividade'>
              <Label___Value
                onTouch={() => router.push('/(authenticated)/(professional)/schedules')}
                value={{ Component: () => <Entypo name="chevron-right" size={24} color={systemColors.primary}/> }}
                separationRow
                LabelComponent={() => (
                  <View className='flex-row gap-2 items-center ml-1'>
                    <Icon
                      name='schedule'
                      sizes={{ height: 20, width: 20 }}
                    />

                    <Text className='font-nunito-bold text-medroom-secondary'>
                      Meus horários
                    </Text>
                  </View>
                )}          
              />

              <Label___Value
                onTouch={() => router.push('/(authenticated)/(professional)/patients')}
                value={{ Component: () => <Entypo name="chevron-right" size={24} color={systemColors.primary}/> }}
                separationRow
                LabelComponent={() => (
                  <View className='flex-row gap-2 items-center ml-1'>
                    <Icon
                      name='people'
                      sizes={{ height: 20, width: 20 }}
                    />

                    <Text className='font-nunito-bold text-medroom-secondary'>
                      Pacientes
                    </Text>
                  </View>
                )}          
              />

              <Label___Value
                onTouch={() => router.push('/(authenticated)/(professional)/profile/paymentsHistory')}
                LabelComponent={() => (
                  <View className='flex-row gap-2 items-center ml-1'>
                    <Icon
                      name='money'
                      sizes={{ height: 20, width: 20 }}
                      />

                    <Text className='font-nunito-bold text-medroom-secondary'>
                      Histórico de pagamentos
                    </Text>
                  </View>
                )}          
                value={{ Component: () => (
                  <View className='flex-row gap-2'>
                    <View className='bg-medroom-primary px-[8px] rounded-full justify-center items-center'>
                      <Text className='text-white font-nunito-bold'>
                        {'2'}
                      </Text>
                    </View>

                    <Entypo name="chevron-right" size={24} color={systemColors.primary}/> 
                  </View>
                )}}
              />
            </Section>





            <Button.Default
              label='Sair da conta'
              icon={{ name: 'logout', color: 'red', size: { height: 22, width: 22 } }}
              onTouch={() => setSignOutConfirm(true)}
              customStyle={{ 
                container : 'bg-red-100/50 border-red-600', 
                text      : 'text-red-600' 
              }}
            />
          </View>
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Profile