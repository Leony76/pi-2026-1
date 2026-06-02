import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Button } from '../button';
import { SystemTabs } from '@/types/systemTabs.type';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
import Icon from '../ui/Icon';
import { useAuth } from '@/contexts/auth.context';
import { Modal } from '../modal';

type Props = {
  children    : React.ReactNode; 
  tab         : SystemTabs;
  title       : string;
  description : string;
  headerHidden? : boolean;
  mainPxOff?  : boolean;
  goBack?     : () => void;
  layoutType  : 'PROFESSIONAL' | 'ENTERPRISE'; 
};

const SystemLayout = (props:Props): React.JSX.Element => {

  const router = useRouter();

  const { signOut } = useAuth();
  const [ signOutConfirm, setSignOutConfirm ] = useState<boolean>(false);

  const professionalTabs = [
    { text: 'Início'    , icon: 'home' as const     , id: 'HOME'      , route: '/(authenticated)/(professional)/home'      },
    { text: 'Horários'  , icon: 'schedule' as const , id: 'SCHEDULES' , route: '/(authenticated)/(professional)/schedules' },
    { text: 'Pacientes' , icon: 'people' as const   , id: 'PATIENTS'  , route: '/(authenticated)/(professional)/patients'  },
    { text: 'Perfil'    , icon: 'person' as const   , id: 'PROFILE'   , route: '/(authenticated)/(professional)/profile'   },
  ];

  const enterpriseTabs = [
    { text: 'Painel'    , icon: 'dashboard' as const     , id: 'DASHBOARD' , route: '/(authenticated)/(enterprise)/dashboard'      },
    { text: 'Clientes'  , icon: 'customers' as const     , id: 'CUSTOMERS' , route: '/(authenticated)/(enterprise)/customers' },
    { text: 'Valores'   , icon: 'values' as const        , id: 'VALUES'    , route: '/(authenticated)/(enterprise)/values'  },
    { text: 'Salas'     , icon: 'room' as const          , id: 'ROOMS'      , route: '/(authenticated)/(enterprise)/rooms'   },
  ];

  return (
    <View className='flex-1'>

      { signOutConfirm &&
        <Modal.ConfirmAction
          onConfirm={signOut}
          confirmMessage='Tem certeza em sair do sistema ?'
          onRequestClose={() => setSignOutConfirm(false)}
          visible={signOutConfirm}
        />
      }

      { !props.headerHidden &&  
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

            <Text className='text-white font-nunito break-all'>
              {props.description}
            </Text>
          </View>

          <TouchableOpacity 
          className='ml-auto'
          activeOpacity={0.67}
          onPress={() => setSignOutConfirm(true)}
          >
            <Icon
              name='logout' 
              color='#ffffff' 
              sizes={{ height: 28, width: 28 }}
            />
          </TouchableOpacity>
        </View>
      }

      <View className={`flex-1 gap-5 ${props.mainPxOff ? 'px-0' : 'px-6'}`}>
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
          enterpriseTabs.map((item) => (
            <Button.NavMenu
              key={item.id}
              { ...item }
              selected={props.tab === item.id}
              onTouch={() => router.replace(item.route as any)}
            />
        )))}
      </View>
    </View>
  )
}

export default SystemLayout