import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLoggedUserData } from '@/contexts/LoggedUserData.context';
import { Redirect } from 'expo-router';

export default function AuthenticatedIndex(): React.JSX.Element {
  const { profile, isLoading } = useLoggedUserData();

  if (isLoading) {
    return <LoadingScreen message='Carregando seu perfil...' />;
  }

  return (
    <Redirect
      href={profile?.accountType === 'ENTERPRISE'
        ? '/(authenticated)/(enterprise)/dashboard'
        : '/(authenticated)/(professional)/home'}
    />
  );
}