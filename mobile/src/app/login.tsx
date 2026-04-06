import React, { useState } from "react";
import { View, Text, ScrollView, StatusBar } from "react-native";
import Icon from "../components/ui/Icon";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Link } from "expo-router";

// ─── Tela de Login Principal ─────────────────────────────────────────────────

const Login = () => {
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = () => {
    // Lógica de login aqui
    console.log("Entrar com:", email, senha);
    try {

    } catch (error:unknown) {
      if (error instanceof Error)
      console.log(error.message);
    }
  };

  return (
    <ScrollView
    contentContainerStyle={{ flexGrow: 1 }}
    keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#white" />

      <View className="flex-1 bg-white px-8 pt-16 pb-10 gap-5">

        {/* ── Logo e título ─────────────────────── */}
        <View className="items-center">
          <Icon
            name="medRoom_logo"
            sizes={{ height: 180, width: 180 }}
          />
        </View>

        {/* ── Cabeçalho Entrar ──────────────────── */}
        <View className="flex-row items-center gap-3 justify-center">
          <Icon
            name="signin"
            sizes={{ height: 32, width: 24 }}
          />

          <Text className="text-4xl font-bold mb-1 font-nunito text-medroom-primary">
            Entrar
          </Text>
        </View>

        {/* ── Campo Email ───────────────────────── */}
        
        <Input.Style1
          label="E-mail"
          type="TEXT"
          autoCorrect
          onChange={(email):void => setEmail(email)}
          placeholder={{ text: 'exemplo@gmail.com' }}
          value={email}      
          icon={{
            name: 'mail',
          }}
        />

        {/* ── Campo Senha ───────────────────────── */}
        
        <Input.Style1
          label="Senha"
          type="PASSWORD"
          onChange={(senha):void => setSenha(senha)}
          placeholder={{ text: '*******' }}
          value={senha}      
          icon={{
            name: 'lock',
            size: {
              width: 20,
              height: 24,
            }
          }}
        />

        {/* ── Botão Entrar ──────────────────────── */}

        <Button.Default
          onTouch={() => handleLogin()}
          label="Entrar"
          icon="signin"
          filled
        />

        {/* ── Links inferiores ──────────────────── */}
        <View className="items-center gap-y-3">
          <View className="flex-row gap-1">
            <Text className="font-nunito text-medroom-secondary">
              Não tem uma conta?
            </Text>

            <Link
            href={'/register'}
            className="font-nunito-bold underline font-medium"
            style={{ color: "#1AAFB4" }}
            onPress={() => console.log("Ir para cadastro")}
            >
              Cadastre-se!
            </Link>
          </View>

          <Text className="font-nunito-bold text-sm italic text-medroom-secondary">
            ou
          </Text>

          <Link
          href={'/forgotPassword'}
          className="font-nunito-bold text-sm underline text-medroom-primary"
          onPress={() => console.log("Recuperar senha")}
          >
            Esqueceu sua senha?
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

export default Login;