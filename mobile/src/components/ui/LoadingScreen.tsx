import React from 'react';
import { View, ActivityIndicator, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { systemColors } from '@/constants/misc/systemColors.misc';

const LoadingScreen = ({ message = "Carregando sua área de saúde..." }: { message?: string }) => {
  return (
    <LinearGradient
    colors={[systemColors.primary, '#0B4C4E']} 
    className="flex-1 justify-center items-center"
    >
      <StatusBar 
        barStyle={'light-content'} 
        translucent={true} 
      />

      <View className={`absolute -top-10 opacity-50 -right-20 w-72 h-72 rounded-full bg-[${systemColors.primary}]`} />
      <View className='absolute opacity-50 bottom-16 -left-16 w-48 h-48 rounded-full bg-[#12777b]'/>

      <View className="items-center gap-8">
        <Icon
          name='medRoom_logo_from_loading_screen'
          sizes={{ width: 200, height: 200 }}
        />
        
        <ActivityIndicator 
          size="large" 
          color={'#ffffff'}
        />
      </View>

      <Text className="absolute bottom-16 text-[var(--medroom-primary-color)] text-[15px] font-nunito">
        { message }
      </Text>
    </LinearGradient>
  );
};

export default LoadingScreen;