import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";

const Login = () => {
  const router = useRouter();
  
  return (
    <View className="flex-1 justify-center items-center gap-4">
      <Text className="text-3xl text-blue-500 italic">
        Login
      </Text>

      <View className="flex-row gap-2 w-[50%]">
        <Pressable 
        onPress={() => router.push("/dashboard")} 
        className="bg-blue-500 p-4 rounded flex-1 items-center"
        >
          <Text className="text-white font-bold">
            Ir para Dashboard
          </Text>
        </Pressable>

        <Pressable 
        onPress={() => router.push("/register")} 
        className="bg-blue-500 p-4 rounded flex-1 items-center"
        >
          <Text className="text-white font-bold">
            Ir para Cadastro
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export default Login