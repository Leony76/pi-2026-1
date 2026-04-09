import { Redirect } from "expo-router";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/auth.context";

export default function Index() {
  const { token, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return <LoadingScreen message="Carregando sessao..." />;
  }

  return <Redirect href={token ? "/(authenticated)/dashboard" : "/login"} />;
}