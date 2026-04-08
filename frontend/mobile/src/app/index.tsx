import { FlatList, View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRestaurants } from '../hooks/useRestaurants';
import { RestaurantCard } from '../components/RestaurantCard';
import { theme } from '../theme/theme';
import RestuarantView from '../views/RestaurantView';

export default function HomePageMobile() {
  return (
    <SafeAreaView style={theme.common.screenContainer}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RestuarantView />
      </View>
    </SafeAreaView>
  );
}