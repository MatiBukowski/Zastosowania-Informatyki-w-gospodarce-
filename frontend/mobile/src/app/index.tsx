import { View } from 'react-native';
import { theme } from '../theme/theme';

import RestaurantView from '../views/RestaurantView';
import ScanQrButton from '../components/buttons/ScanQrButton';

export default function HomePageMobile() {
  return (
    <View style={theme.common.screenContainer}>
      <ScanQrButton />
      <RestaurantView />
    </View>
  );
}