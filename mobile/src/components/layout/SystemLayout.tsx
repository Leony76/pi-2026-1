import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Button } from '../button';
import { SystemTabs } from '@/types/systemTabs.type';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';

type Props = {
  children    : React.ReactNode; 
  tab         : SystemTabs;
  title       : string;
  description : string;
  goBack?     : () => void;
  layoutType  : 'PROFESSIONAL' | 'ENTERPRISE'; 
};

const SystemLayout = (props:Props) => {

  const router = useRouter();

  const professionalTabs = [
    { text: 'Início'    , icon: 'home' as const     , id: 'HOME'      , route: '/(authenticated)/(professional)/home'      },
    { text: 'Horários'  , icon: 'schedule' as const , id: 'SCHEDULES' , route: '/(authenticated)/(professional)/schedules' },
    { text: 'Pacientes' , icon: 'people' as const   , id: 'PATIENTS'  , route: '/(authenticated)/(professional)/patients'  },
    { text: 'Perfil'    , icon: 'person' as const   , id: 'PROFILE'   , route: '/(authenticated)/(professional)/profile'   },
  ];

  return (
    <View className='flex-1'>
      <View className='flex-row items-center gap-5 bg-medroom-primary p-6 shadow-md'>
        { props.goBack && (
          <TouchableOpacity 
          onPress={props.goBack}
          className='bg-cyan-100/25 px-3 py-2.5 rounded-full'
          >
            <FontAwesome5 
              name="arrow-left" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        )}

        <View>
          <Text 
          numberOfLines={1} 
          className='text-white font-nunito-bold text-2xl'
          >
            {props.title}
          </Text>

          <Text className='text-white font-nunito'>
            {props.description}
          </Text>
        </View>
      </View>

      <View className='flex-1 px-6 gap-5'>
        {props.children}
      </View>

      <View className='flex-row justify-around bg-medroom-primary rounded-t-xl py-3'>
        { props.layoutType === 'PROFESSIONAL' ? (
          professionalTabs.map((item) => (
            <Button.NavMenu
              { ...item }
              key={item.id}
              selected={props.tab === item.id}
              onTouch={() => router.replace(item.route as any)}
            />
          ))
        ) : (
          <>
            <Button.NavMenu
              text='Painel'
              icon='home'
              selected={props.tab === 'DASHBOARD'}
              onTouch={() => {}}
            />

            <Button.NavMenu
              text='Clientes'
              icon='schedule'
              selected={props.tab === 'CUSTOMERS'}
              onTouch={() => {}}
            />

            <Button.NavMenu
              text='Valores'
              icon='people'
              selected={props.tab === 'VALUES'}
              onTouch={() => {}}
            />

            <Button.NavMenu
              text='Salas'
              icon='person'
              selected={props.tab === 'ROOMS'}
              onTouch={() => {}}
            />
          </>
        )}
      </View>
    </View>
  )
}

export default SystemLayout