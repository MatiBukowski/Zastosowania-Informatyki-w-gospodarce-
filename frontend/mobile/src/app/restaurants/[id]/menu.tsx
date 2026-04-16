import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetRestaurantMenu } from '../../../hooks/useRestaurants';
import { theme } from '../../../theme/theme';
import { Stack } from 'expo-router';
export default function MenuScreen() {
  const { id } = useLocalSearchParams();
    const { menu, loading, error } = useGetRestaurantMenu(Number(id));

    if (loading) {
        return (
          <View style={theme.common.screenContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        );
      }

      // If the menu is empty or an error occurred
      if (!menu || menu.length === 0 || error) {
        return (
          <View style={theme.common.screenContainer}>
            <Stack.Screen
              options={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerShadowVisible: false
              }}
            />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 }}>
              <Text style={[theme.typography.h5, { color: theme.colors.text }]}>
                No menu available
              </Text>
              <Text style={[theme.typography.caption, { marginTop: 8 }]}>
                Check back later!
              </Text>
            </View>
          </View>
        );
      }

    return (
        <View style={{ flex: 1, padding: 20, paddingTop: 60, backgroundColor: theme.colors.background }}>
          <Stack.Screen
                options={{
                  headerStyle: { backgroundColor:  theme.colors.background },
                  headerShadowVisible: false,
                }}
              />

        <ScrollView
            contentContainerStyle={{ padding: 20, paddingTop: 60 }}
            showsVerticalScrollIndicator={false}
            >

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
        </ScrollView>
      </View>
    );
}