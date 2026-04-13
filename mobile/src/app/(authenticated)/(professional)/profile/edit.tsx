import { Button } from '@/components/button'
import { Input } from '@/components/input'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SystemLayout from '@/components/layout/SystemLayout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, View } from 'react-native'
import { Select } from '@/components/select'
import { formatPhone } from '@/utils/formatPhone'
import { formatCrmCrp } from '@/utils/formatCrmCrp'
import { ProfileEditFormData, profileEditSchema } from '@/schemas/profileEdit.schema'
import React from 'react'

const Edit = (): React.JSX.Element => {

  const router = useRouter();

  const {
    control, 
    handleSubmit, 
    formState: { errors }
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: { 
      email     : '', 
      name      : '',
      phone     : '',
      crmCrp    : '',
      specialty : '',
    }
  }); 

  const handleSaveNewProfileData = async( data: ProfileEditFormData ): Promise<void> => {
    console.log(data);

    router.push({
      pathname: '/(authenticated)/(professional)/profile',
      params: {
        message: 'Dados alterados com sucesso!'
      },
    })
  };

  return (
    <LayoutWrapper>
      <SystemLayout
      title='Dados pessoais'
      description='Atualiza suas informações'
      tab='PATIENTS'
      layoutType='PROFESSIONAL'   
      goBack={() => router.back()} 
      >
        <ScrollView contentContainerClassName='flex-1 py-6 gap-5 justify-center'>
          <View className={`gap-3 rounded-xl border-2 bg-cyan-50/10 border-medroom-primaryLight p-3 flex-col`}>
            <View>
              <Controller
                control={control}
                name='name'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'tag' }}
                    maxLength={256}
                    label='Nome completo'
                    onChange={onChange}
                    placeholder={{ text: 'Insira seu nome'}}
                    type='TEXT'
                    onBlur={onBlur}
                    value={value}
                    keyboardType='default'
                  />
                )}
              />

               {errors.name?.message && <Input.Error error={errors.name.message as string}/> }
            </View>

            <View>
              <Controller
                control={control}
                name='specialty'
                render={({ field: { onChange, onBlur } }) => (
                  <Select.Style2
                    icon={{ name: 'suitcase' }}
                    optionsMap='SPECIALTY'
                    label='Especialidade'
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                )}
              />

               {errors.specialty?.message && <Input.Error error={errors.specialty.message as string}/> }
            </View>

            <View>
              <Controller
                control={control}
                name='crmCrp'
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input.Style2
                    icon={{ name: 'paper_roll' }}
                    maxLength={9}
                    label='CRM / CRP'
                    onChange={(crpCrp) => {
                      const crmCrpMask = formatCrmCrp(crpCrp);
                      onChange(crmCrpMask);
                    }}
                    placeholder={{ text: '12345-SP'}}
                    type='TEXT'
                    onBlur={onBlur}
                    value={value ?? ''}
                    keyboardType='default'
                  />
                )}
              />

               {errors.crmCrp?.message && <Input.Error error={errors.crmCrp.message as string}/> }
            </View>
            
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input.Style2
                    icon={{ name: 'mail' }}
                    maxLength={256}
                    label='E-mail'
                    onChange={onChange}
                    placeholder={{ text: 'exemplo@gmail.com'}}
                    type='TEXT'
                    value={value ?? ''}
                    keyboardType='default'
                  />
                )}
              />

              {errors.email?.message && <Input.Error error={errors.email.message as string}/> }
            </View>

            <View>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input.Style2
                    icon={{ name: 'phone' }}
                    maxLength={16}
                    label='Telefone'
                    onChange={(phone) => {
                      const phoneMask = formatPhone(phone);
                      onChange(phoneMask);
                    }}
                    placeholder={{ text: '(XX) XXXXX-XXXX'}}
                    type='TEXT'
                    value={value ?? ''}
                    keyboardType='number-pad'
                  />
                )}
              />

              {errors.phone?.message && <Input.Error error={errors.phone.message as string}/> }
            </View>

            <Button.Default
              customStyle={{ container: 'mt-3' }}
              filled
              disable={Object.keys(errors).length > 1}
              label='Salvar alterações'
              onTouch={handleSubmit(handleSaveNewProfileData)}
              icon={{ name: 'edit', size: { height: 18, width: 18 } }}
            />
          </View>
        </ScrollView>
      </SystemLayout>
    </LayoutWrapper>
  )
}

export default Edit