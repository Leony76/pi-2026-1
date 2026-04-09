import React from 'react'
import { View, StatusBar, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { systemColors } from '@/constants/misc/systemColors.misc';

const LayoutWrapper = ({children}:{children:React.ReactNode}) => {

  const insets = useSafeAreaInsets();

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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingTop: insets.top,
            paddingBottom: insets.bottom 
          }}
        >
          { children }
        </ScrollView>
      </KeyboardAvoidingView>

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