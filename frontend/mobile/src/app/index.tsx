import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, SafeAreaView } from 'react-native';
import { getRestaurants } from '../api/API';
import { theme } from '../theme/theme';

export default function HomePageMobile() {
  const [status, setStatus] = useState<string>('Waiting for database connection...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // testing connection
    getRestaurants()
      .then(data => {
        // show the nr of restaurants to check connection
        setStatus(`Working API! Restaurants: ${data?.length || 0}`);
        setLoading(false);
      })
      .catch(err => {
        setStatus(`API Error: ${err.message}`);
        setLoading(false);
      });
  }, []);

  return (
    <SafeAreaView style={theme.common.screenContainer}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

        <Text style={theme.typography.h4}>
          Restaurant App 🍴
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <Text style={[theme.typography.body, { marginTop: 20, color: theme.colors.text }]}>
            {status}
          </Text>
        )}

      </View>
    </SafeAreaView>
  );
}