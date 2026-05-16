import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '@/ui/theme/theme';
import { restaurantFilterConfig } from '@/utils/restaurantFilters';
import { IRestaurantFilters } from '@/services/interfaces/restaurants';

interface Props {
  visible: boolean;
  onClose: () => void;

  filters: IRestaurantFilters;

  toggleArrayFilter: (
    key: keyof IRestaurantFilters,
    value: string
  ) => void;
}

export function RestaurantFiltersModal({
  visible,
  onClose,
  filters,
  toggleArrayFilter,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24}}>
          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
            Filters
          </Text>

          {Object.entries(
            restaurantFilterConfig
          ).map(([key, config]) => {
            const selectedValues =
              filters[
                key as keyof IRestaurantFilters
              ] || [];

            return (
              <View key={key}>
                <Text style={{ fontWeight: '600', marginBottom: 12 }}>
                  {config.label}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap'}}>
                  {config.options.map(option => {
                    const selected =
                      selectedValues.includes(
                        option.value
                      );

                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() =>
                          toggleArrayFilter(
                            key as keyof IRestaurantFilters,
                            option.value
                          )
                        }
                        style={{
                          backgroundColor: selected
                            ? theme.colors.secondary
                            : '#eee',

                          borderRadius: 16,

                          paddingHorizontal: 12,
                          paddingVertical: 8,

                          marginRight: 8,
                          marginBottom: 8
                        }}
                      >
                        <Text style={{ color: selected? 'white': '#333'}}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-end', marginTop: 16}}>
            <Text style={{ color: theme.colors.primary, fontWeight: '700'}}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}