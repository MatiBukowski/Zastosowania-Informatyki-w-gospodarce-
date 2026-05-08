import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { colors } from '../ui/theme/palette';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: 'home', route: '/' },
  { label: 'Restaurants', icon: 'restaurant', route: '/restaurants' },
  { label: 'Settings', icon: 'settings', route: '/settings' },
];

export default function BottomNavBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  const getCurrentRoute = () => {
    if (segments.length === 0) return '/';
    return `/${segments.join('/')}`;
  };

  const currentRoute = getCurrentRoute();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const isActive = (route: string): boolean => {
    if (route === '/') {
      return currentRoute === '/' || segments.length === 0;
    }
    return currentRoute.includes(route);
  };

  return (
    <View style={{ backgroundColor: '#FFFFFF' }}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.navButton}
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={active ? item.icon : `${item.icon}-outline`}
                  size={28}
                  color={active ? colors.strawberryRed : '#999999'}
                />
                <Text style={[styles.label, { color: active ? colors.strawberryRed : '#999999' }]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ height: insets.bottom, backgroundColor: '#FFFFFF' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
