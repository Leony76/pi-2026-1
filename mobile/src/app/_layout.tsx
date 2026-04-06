import "root/global.css";
import * as SplashScreen from 'expo-splash-screen';
import {  useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Stack } from "expo-router";
import { useEffect } from "react";

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
    <Stack     
    screenOptions={{ headerShown: false }}
    initialRouteName="login"
    >
      <Stack.Screen 
        name="register" 
        options={{ title: 'Cadastro' }} 
      />

      <Stack.Screen 
        name="login" 
        options={{ title: 'Entrar' }} 
      />

      <Stack.Screen 
        name="forgotPassword" 
        options={{ title: 'Esqueci a senha' }} 
      />
    </Stack>
  );
}
