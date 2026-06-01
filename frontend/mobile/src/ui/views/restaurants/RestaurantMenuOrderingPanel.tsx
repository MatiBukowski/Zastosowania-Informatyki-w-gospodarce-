import { useMemo, useState } from 'react';
import { Alert, View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

import StyledButton from '@/ui/components/buttons/StyledButton';
import { createOrder } from '@/services/api/OrderAPI';
import { IMenuItem, OrderSource } from '@/services/interfaces/interfaces';
import { theme } from '@/ui/theme/theme';

interface RestaurantMenuOrderingPanelProps {
  restaurantId: number;
  menu: IMenuItem[];
  tableId?: string;
  reservationId?: string;
}

export default function RestaurantMenuOrderingPanel({
  restaurantId,
  menu,
  tableId,
  reservationId,
}: RestaurantMenuOrderingPanelProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selection = useMemo(
    () =>
      menu
        .filter((item) => (selectedQuantities[item.menu_item_id] || 0) > 0)
        .map((item) => ({
          item,
          quantity: selectedQuantities[item.menu_item_id] || 0,
        })),
    [menu, selectedQuantities]
  );

  const totalSelectedItems = selection.reduce((sum, entry) => sum + entry.quantity, 0);

  const updateQuantity = (item: IMenuItem, delta: number) => {
    if (!item.is_available) return;

    setSelectedQuantities((current) => {
      const nextQuantity = Math.max(0, (current[item.menu_item_id] || 0) + delta);
      const nextState = { ...current };

      if (nextQuantity === 0) {
        delete nextState[item.menu_item_id];
      } else {
        nextState[item.menu_item_id] = nextQuantity;
      }

      return nextState;
    });
  };

  const handleSubmitOrder = async () => {
    if (selection.length === 0) {
      Alert.alert('No items selected', 'Pick at least one menu item before placing an order.');
      return;
    }

    const parsedTableId = tableId ? Number(tableId) : null;
    const parsedReservationId = reservationId ? Number(reservationId) : null;

    if (!parsedTableId || !parsedReservationId) {
      Alert.alert('Reservation required', 'Reserve a table first so we can attach your order to it.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createOrder({
        restaurant_id: restaurantId,
        table_id: parsedTableId,
        reservation_id: parsedReservationId,
        order_source: OrderSource.WEB_APP,
        items: selection.map(({ item, quantity }) => ({
          menu_item_id: item.menu_item_id,
          quantity,
        })),
      });

      posthog.capture('restaurant_order_created', {
        restaurant_id: restaurantId,
        table_id: parsedTableId,
        reservation_id: parsedReservationId,
        item_count: totalSelectedItems,
      });

      Alert.alert('Order placed', 'Your food order has been sent to the restaurant.');
      setSelectedQuantities({});
      router.replace('/');
    } catch (orderError: any) {
      Alert.alert(
        'Could not place order',
        orderError.response?.data?.detail || orderError.message || 'Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View>
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.04)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
          Select items to order
        </Text>
        <Text style={{ marginTop: 4, color: '#666' }}>
          {tableId && reservationId
            ? 'Your reservation is linked, so you can place a food order right away.'
            : 'Reserve a table first to enable food ordering.'}
        </Text>
      </View>

      {menu.map((item) => (
        <View
          key={item.menu_item_id}
          style={{
            marginBottom: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#666',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>{item.name}</Text>
              <Text style={{ fontSize: 14, color: '#666', marginTop: 5, lineHeight: 20 }}>{item.description}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary }}>{item.price} zł</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            <Text style={{ color: item.is_available ? '#666' : '#b45309', fontWeight: '600' }}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable
                onPress={() => updateQuantity(item, -1)}
                disabled={!item.is_available || !selectedQuantities[item.menu_item_id]}
                style={({ pressed }) => [
                  {
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      item.is_available && selectedQuantities[item.menu_item_id] ? theme.colors.primary : '#ddd',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>-</Text>
              </Pressable>
              <Text style={{ minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
                {selectedQuantities[item.menu_item_id] || 0}
              </Text>
              <Pressable
                onPress={() => updateQuantity(item, 1)}
                disabled={!item.is_available}
                style={({ pressed }) => [
                  {
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: item.is_available ? theme.colors.primary : '#ddd',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}

      <View
        style={{
          marginTop: 8,
          padding: 16,
          borderRadius: 16,
          backgroundColor: 'rgba(0,0,0,0.04)',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
          Selected items: {totalSelectedItems}
        </Text>
        <Text style={{ marginTop: 4, color: '#666' }}>
          Add the dishes you want, then send the order to the kitchen.
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <StyledButton
          onPress={handleSubmitOrder}
          disabled={isSubmitting || totalSelectedItems === 0 || !tableId || !reservationId}
          accessibilityLabel="Place order"
        >
          {isSubmitting ? 'Placing order...' : 'Place order'}
        </StyledButton>
      </View>
    </View>
  );
}