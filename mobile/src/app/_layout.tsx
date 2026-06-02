import "root/global.css";
import * as SplashScreen from 'expo-splash-screen';
import {  useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { systemColors } from "@/constants/misc/systemColors.misc";
import { AuthProvider } from "@/contexts/auth.context";
import { UserProvider } from "@/contexts/LoggedUserData.context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Nunito-Regular' : Nunito_400Regular,
    'Nunito-Bold'    : Nunito_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <AuthProvider>
      <UserProvider>
        <SafeAreaProvider>
          <StatusBar 
            barStyle="dark-content" 
            backgroundColor={systemColors.primary} 
          />

          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </UserProvider>
    </AuthProvider>
  );
}
