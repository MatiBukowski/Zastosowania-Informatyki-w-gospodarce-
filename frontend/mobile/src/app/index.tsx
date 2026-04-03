import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, SafeAreaView } from 'react-native';
import { getRestaurants } from '../api/RestaurantAPI';
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