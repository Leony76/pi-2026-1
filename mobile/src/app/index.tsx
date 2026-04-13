import { Redirect } from "expo-router";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/contexts/auth.context";

export default function Index(): React.JSX.Element {
  const { token, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return <LoadingScreen message="Carregando sessão..." />;
  }

  return <Redirect href={token ? "/(authenticated)/(professional)/home" : "/login"} />;
}