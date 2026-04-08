import React, { useEffect, useState } from 'react'
import { View, StatusBar, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../ui/LoadingScreen';
import { systemColors } from '@/constants/misc/systemColors.misc';

const LayoutWrapper = ({children}:{children:React.ReactNode}) => {

  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 500);
    
  //   return () => clearTimeout(timer);
  // }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ 
        height: insets.top, 
        backgroundColor: systemColors.primary, 
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 999
      }} />

      <StatusBar 
        barStyle={'light-content'} 
        translucent={true} 
      />

      <ScrollView 
      contentContainerStyle={{ 
        flexGrow: 1, 
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }}
      >
        { children }
      </ScrollView>

      <View style={{ 
        height: insets.bottom, 
        backgroundColor: systemColors.primary, 
        position: 'absolute', 
        bottom: 0, 
        width: '100%' 
      }} />
    </View>
  )
}

export default LayoutWrapper