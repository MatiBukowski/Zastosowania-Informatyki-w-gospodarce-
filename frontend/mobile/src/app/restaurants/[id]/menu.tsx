import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetRestaurantMenu } from '../../../hooks/useRestaurants';
import { theme } from '../../../theme/theme';
import { Stack } from 'expo-router';
export default function MenuScreen() {
  const { id } = useLocalSearchParams();
    const { menu, loading, error } = useGetRestaurantMenu(Number(id));

    // Mock data - to be removed
/*
    // to view mock data, in line 8 replace 'const' with 'let' and uncomment the block below
  if (!loading && (menu.length === 0 || error)) {
    menu = [
      { menu_item_id: 1, name: "Test Pizza", price: "45.00", description: "Delicious test pizza", is_available: true },
      { menu_item_id: 2, name: "Test Burger", price: "32.50", description: "Juicy beef burger", is_available: true },
      { menu_item_id: 3, name: "Caesar Salad", price: "28.00", description: "Classic Caesar salad", is_available: true }
    ];
  }
*/
    return (
        <View style={{ flex: 1, padding: 20, paddingTop: 60, backgroundColor: theme.colors.background }}>
          <Stack.Screen
                options={{
                  headerStyle: { backgroundColor:  theme.colors.background },
                  headerTintColor: theme.colors.primary,
                  headerShadowVisible: false,
                }}
              />

          <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: theme.colors.text }}>
            Menu
          </Text>

          {menu.map(item => (
            <View key={item.menu_item_id} style={{
              marginBottom: 20,
              paddingBottom: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#666'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{item.name}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary }}>{item.price} zł</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#666', marginTop: 5, lineHeight: 20 }}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>
      );
}