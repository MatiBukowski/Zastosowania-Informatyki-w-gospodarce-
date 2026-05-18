import { Text } from 'react-native';

import { theme } from '@/ui/theme/theme';
import { ScreenLayout } from '@/ui/layouts/ScreenLayout';

export default function SettingsPage() {
  return (
    <ScreenLayout>
      <Text style={theme.typography.h4}>Settings</Text>
    </ScreenLayout>
  );
}
