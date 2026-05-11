import { Redirect } from 'expo-router';

export default function Index() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('app_opened');
  }, []);
  
  return <Redirect href="/tabs/home" />;
}
