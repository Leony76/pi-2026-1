import React from 'react'
import { Text, View } from 'react-native'
import { Button } from '../button';
import { SystemTabs } from '@/types/systemTabs.type';

type Props = {
  children    : React.ReactNode; 
  tab         : SystemTabs;
  title       : string;
  description : string;
  goBack?     : () => void;
  layoutType  : 'PROFSSIONAL' | 'ENTERPRISE'; 
};

const SystemLayout = (props:Props) => {
  return (
    <View className='flex-1'>
      <View className='bg-medroom-primary p-6 shadow-md'>
        <Text className='text-white font-nunito-bold text-2xl'>
          {props.title}
        </Text>

        <Text className='text-white font-nunito'>
          {props.description}
        </Text>
      </View>

      <View className='flex-1 p-6 gap-5'>
        {props.children}
      </View>

      <View className='flex-row justify-around bg-medroom-primary rounded-t-xl py-3'>
        { props.layoutType === 'PROFSSIONAL' ? (
          <>
            <Button.NavMenu
              text='Início'
              icon='home'
              selected={props.tab === 'HOME'}
            />

            <Button.NavMenu
              text='Horários'
              icon='schedule'
              selected={props.tab === 'SCHEDULES'}
            />

            <Button.NavMenu
              text='Pacientes'
              icon='people'
              selected={props.tab === 'PATIENTS'}
            />

            <Button.NavMenu
              text='Perfil'
              icon='person'
              selected={props.tab === 'PROFILE'}
            />
          </>
        ) : (
          <>
            <Button.NavMenu
              text='Painel'
              icon='home'
              selected={props.tab === 'DASHBOARD'}
            />

            <Button.NavMenu
              text='Clientes'
              icon='schedule'
              selected={props.tab === 'CUSTOMERS'}
            />

            <Button.NavMenu
              text='Valores'
              icon='people'
              selected={props.tab === 'VALUES'}
            />

            <Button.NavMenu
              text='Salas'
              icon='person'
              selected={props.tab === 'ROOMS'}
            />
          </>
        )}
      </View>
    </View>
  )
}

export default SystemLayout