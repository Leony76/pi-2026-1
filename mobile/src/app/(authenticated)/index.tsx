import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLoggedUserData } from '@/contexts/LoggedUserData.context';
import { Redirect } from 'expo-router';

export default function AuthenticatedIndex(): React.JSX.Element {
  const { accountType, isLoading } = useLoggedUserData();

  if (isLoading) {
    return <LoadingScreen message='Carregando seu perfil...' />;
  }

  return (
    <Redirect
      href={accountType === 'ENTERPRISE'
        ? '/(authenticated)/(enterprise)/dashboard'
        : '/(authenticated)/(professional)/home'}
    />
  );
}