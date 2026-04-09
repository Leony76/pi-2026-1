import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/auth.context";
import { Redirect, Stack } from "expo-router";

export default function AuthenticatedLayout() {
  const { token, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return <LoadingScreen message="Carregando sua sessao..."/>;
  }

  if (!token) {
    return <Redirect href="/login"/>;
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
