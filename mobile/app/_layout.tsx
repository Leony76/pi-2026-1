import "../global.css"
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack 
    screenOptions={{ headerShown: false }}
    initialRouteName="index"
    >
      <Stack.Screen 
        name="register" 
        options={{ title: 'Cadastro' }} 
      />

      <Stack.Screen 
        name="index" 
        options={{ title: 'Entrar' }} 
      />

      <Stack.Screen 
        name="dashboard" 
        options={{ title: 'Dashboard' }} 
      />
    </Stack>
  );
}
