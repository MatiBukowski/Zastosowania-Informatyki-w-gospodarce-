import { ScrollView } from 'react-native';
import { theme } from '../theme/theme';

import ScanQrButton from '../components/buttons/ScanQrButton';

export default function HomePageMobile() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={theme.common.screenContainer}>
      <ScanQrButton />
      {/* Future content can be added here */}
    </ScrollView>
  );
}