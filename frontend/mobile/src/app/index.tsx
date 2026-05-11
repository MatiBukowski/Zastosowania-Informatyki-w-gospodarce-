import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';

export default function Index() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('app_opened');
  }, []);
  
  return <Redirect href="/tabs/home" />;
}
