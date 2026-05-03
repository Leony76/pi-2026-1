import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useLoggedUserData } from '@/contexts/LoggedUserData.context';
import { systemColors } from '@/constants/misc/systemColors.misc';

export default function EnterpriseLayout() {
  const router = useRouter();
  const { profile, isLoading } = useLoggedUserData();

  useEffect(() => {
    if (isLoading) return;

    if (profile && profile.accountType !== 'ENTERPRISE') {
      router.replace('/(authenticated)/(professional)/home');
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={systemColors.primary} />
      </View>
    );
  }

  if (profile && profile.accountType === 'ENTERPRISE') {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={systemColors.primary} />
    </View>
  );
}
