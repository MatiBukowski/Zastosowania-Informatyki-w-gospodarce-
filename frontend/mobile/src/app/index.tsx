import { View, SafeAreaView } from 'react-native';
import { theme } from '../theme/theme';
import RestaurantView from '../views/RestaurantView';
import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';

export default function HomePageMobile() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('app_opened');
  }, []);

  return (
    <SafeAreaView style={theme.common.screenContainer}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RestaurantView />
      </View>
    </SafeAreaView>
  );
}