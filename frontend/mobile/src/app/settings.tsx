import { ScrollView, Text } from 'react-native';
import { theme } from '../theme/theme';

export default function SettingsPage() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={theme.common.screenContainer}>
      <Text style={theme.typography.h4}>Settings</Text>
      {/* Settings content to be added */}
    </ScrollView>
  );
}
