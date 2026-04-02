import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Pressable,
  Image,
} from "react-native";
// ─── Ícones via PNG ──────────────────────────────────────────────────────────
const EmailIcon = () => (
  <Image
    source={require("../assets/images/icon-email.png")}
    style={{ width: 22, height: 18 }}
    resizeMode="contain"
  />
);

const LockIcon = () => (
  <Image
    source={require("../assets/images/icon-lock.png")}
    style={{ width: 18, height: 22 }}
    resizeMode="contain"
  />
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <Image
    source={
      visible
        ? require("../assets/images/icon-eye-open.png")
        : require("../assets/images/icon-eye-closed.png")
    }
    style={{ width: 24, height: 24 }}
    resizeMode="contain"
  />
);

const LoginIcon = () => (
  <Image
    source={require("../assets/images/icon-login.png")}
    style={{ width: 28, height: 28 }}
    resizeMode="contain"
  />
);

// ─── Tela de Login Principal ─────────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  const handleLogin = () => {
    // Lógica de login aqui
    console.log("Entrar com:", email, senha);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      className="bg-white"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="flex-1 bg-white px-8 pt-16 pb-10">

        {/* ── Logo e título ─────────────────────── */}
        <View className="items-center mb-8">
          <Image
            source={require("../assets/images/medroom-logo.png")}
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
        </View>

        {/* ── Cabeçalho Entrar ──────────────────── */}
        <View className="flex-row items-center mb-8">
          <LoginIcon />
          <Text
            className="text-4xl font-bold ml-2"
            style={{ color: "#1AAFB4" }}
          >
            Entrar
          </Text>
        </View>

        {/* ── Campo Email ───────────────────────── */}
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <EmailIcon />
            <Text
              className="text-lg font-semibold ml-2"
              style={{ color: "#1AAFB4" }}
            >
              Email
            </Text>
          </View>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="exemplo@gmail.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            style={{
              borderBottomWidth: 2,
              borderBottomColor: emailFocused ? "#1AAFB4" : "#D1D5DB",
              paddingVertical: 8,
              fontSize: 16,
              color: "#1C1C1E",
            }}
          />
        </View>

        {/* ── Campo Senha ───────────────────────── */}
        <View className="mb-8">
          <View className="flex-row items-center mb-2">
            <LockIcon />
            <Text
              className="text-lg font-semibold ml-2"
              style={{ color: "#1AAFB4" }}
            >
              Senha
            </Text>
          </View>

          <View className="flex-row items-center">
            <TextInput
              value={senha}
              onChangeText={setSenha}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              onFocus={() => setSenhaFocused(true)}
              onBlur={() => setSenhaFocused(false)}
              style={{
                flex: 1,
                borderBottomWidth: 2,
                borderBottomColor: senhaFocused ? "#1AAFB4" : "#D1D5DB",
                paddingVertical: 8,
                fontSize: 16,
                color: "#1C1C1E",
              }}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ position: "absolute", right: 4, bottom: 8 }}
            >
              <EyeIcon visible={showPassword} />
            </Pressable>
          </View>
        </View>

        {/* ── Botão Entrar ──────────────────────── */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.85}
          className="rounded-xl py-4 items-center mb-8"
          style={{ backgroundColor: "#1AAFB4" }}
        >
          <Text className="text-white text-lg font-bold tracking-wide">
            Entrar
          </Text>
        </TouchableOpacity>

        {/* ── Links inferiores ──────────────────── */}
        <View className="items-center gap-y-3">
          <Text className="text-base" style={{ color: "#6B7280" }}>
            Não tem uma conta?{" "}
            <Text
              className="underline font-medium"
              style={{ color: "#1AAFB4" }}
              onPress={() => console.log("Ir para cadastro")}
            >
              Cadastre-se!
            </Text>
          </Text>

          <Text className="text-sm italic" style={{ color: "#6B7280" }}>
            ou
          </Text>

          <Text
            className="text-base underline"
            style={{ color: "#1AAFB4" }}
            onPress={() => console.log("Recuperar senha")}
          >
            Esqueceu sua senha?
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}