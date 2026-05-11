import { theme } from '@/ui/theme/theme';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

export const SwipeTabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SwipeTabs
      tabBarPosition='bottom'
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,

        tabBarStyle: {
          backgroundColor: 'white',
          paddingBottom: insets.bottom,
        },

        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#888',

        tabBarIndicatorStyle: {
          display: 'none',
        },
      }}
    >
      <SwipeTabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      <SwipeTabs.Screen
        name="restaurants"
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="restaurant" size={24} color={color} />
          ),
        }}
      />

      <SwipeTabs.Screen
        name="settings"
        options={{
          title: 'Settings',
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </SwipeTabs>
  );
}