import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Image as ExpoImage } from 'expo-image';

import { IRestaurant, CuisineType } from '@/services/interfaces/interfaces';
import { theme } from '@/ui/theme/theme';

function CuisineBox({cuisine, phone}: {cuisine: CuisineType; phone?: string | null}) {
  return (
    <View style={RestaurantCardStyles.common.cuisineBox}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {getCuisineIcon(cuisine)}
        <View style={{ marginLeft: 8 }}>
          <Text style={[theme.typography.body, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">{cuisine}</Text>
        </View>
      </View>
      {phone ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
          <Text style={[theme.typography.body, { color: '#000', marginRight: 6 }]}>{phone}</Text>
          <Ionicons name='call' style={[RestaurantCardStyles.icon, { fontSize: 16, color: '#000' }]} />
        </View>
      ) : null}
    </View>
  )
}

function PhotoBox({photoUrl}: {photoUrl: string | null}) {
  return (
    <View>
      {photoUrl ? (
        <ExpoImage
          style={RestaurantCardStyles.common.photo}
          source={{ uri: photoUrl }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
      ) : (
        <View style={RestaurantCardStyles.common.photoPlaceholder}>
          <MaterialIcons name='image-not-supported' size={32} color={theme.colors.gray} />
        </View>
      )}
    </View>
  )
}

function LocationBox({address}: {address: string}) {
  return (
    <View style={RestaurantCardStyles.common.locationBox}>
      <Ionicons name='location-outline' style={RestaurantCardStyles.icon} />
      <Text style={[theme.typography.body, { color: theme.colors.text, marginLeft: 4 }]}>{address}</Text>
    </View>
  )
}



function ScheduleBox({schedules}: {schedules?: any[]}) {
  if (!schedules || schedules.length === 0) return null;
  const s = schedules[0];
  const openTime = s?.open_time ?? '';
  const closeTime = s?.close_time ?? '';
  return (
    <View style={RestaurantCardStyles.common.scheduleBox}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name='log-in-outline' style={[RestaurantCardStyles.icon, { fontSize: 16 }]} />
        <Text style={[theme.typography.body, { color: theme.colors.text, marginLeft: 6 }]}>{openTime}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
        <Ionicons name='log-out-outline' style={[RestaurantCardStyles.icon, { fontSize: 16 }]} />
        <Text style={[theme.typography.body, { color: theme.colors.text, marginLeft: 6 }]}>{closeTime}</Text>
      </View>
    </View>
  )
}

function RestaurantCard({
  restaurant,
  pressEnabled = true,
}: {
  restaurant: IRestaurant;
  pressEnabled?: boolean;
}) {
  const router = useRouter();
  const posthog = usePostHog();

  const handlePress = () => {
    posthog.capture('restaurant_card_clicked', {
      restaurant_id: restaurant.restaurant_id,
      restaurant_name: restaurant.name,
      cuisine: restaurant.cuisine
    });
    router.push(`/restaurants/${restaurant.restaurant_id}` as any);
  };

  return (
    <View style={[theme.common.card, RestaurantCardStyles.card]}>
      <TouchableOpacity
        activeOpacity={1}
        delayPressIn={80}
        onPress={pressEnabled ? handlePress : undefined}
      >
        <PhotoBox photoUrl={restaurant.photo} />
        <View style={RestaurantCardStyles.content}>
          <Text
            style={[theme.typography.h5, { color: theme.colors.secondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {restaurant.name}
          </Text>
          {/** build human readable address from fields when available */}
          <LocationBox address={restaurant.street && restaurant.building_number ? `${restaurant.street} ${restaurant.building_number}, ${restaurant.postal_code || ''} ${restaurant.city || ''}` : (restaurant.address || '')} />
          <ScheduleBox schedules={(restaurant as any).schedules} />
          <CuisineBox cuisine={restaurant.cuisine} phone={(restaurant as any).phone_number ?? (restaurant as any).phone} />
        </View>
      </TouchableOpacity>
    </View>
  )
}

const RestaurantCardStyles = {
  card: {
    padding: 0,
    overflow: 'hidden' as const,
  },
  content: {
    flexDirection: 'column' as const,
    padding: 8,
  },
  icon: {
    fontSize: 20,
    color: theme.colors.text,
  },
  common: StyleSheet.create({
    photo: {
      width: '100%',
      height: 200,
    },
    photoPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: 200,
    },
    locationBox: {
      flexDirection: 'row', 
      alignItems: 'center', 
      marginTop: 8
    },
    
    scheduleBox: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    cuisineBox: {
      flexDirection: 'row', 
      alignItems: 'center', 
      marginTop: 8
    }
  }),
}

const cuisineIconMap = {
  [CuisineType.ITALIAN]: { name: 'pizza', lib: MaterialCommunityIcons },
  [CuisineType.AMERICAN]: { name: 'hamburger', lib: MaterialCommunityIcons },
  [CuisineType.POLISH]: { name: 'dinner-dining', lib: MaterialIcons },
  [CuisineType.MEDITERRANEAN]: { name: 'set-meal', lib: MaterialIcons },
  [CuisineType.GREEK]: { name: 'restaurant', lib: MaterialIcons },
  [CuisineType.FRENCH]: { name: 'baguette', lib: MaterialCommunityIcons },
  [CuisineType.SPANISH]: { name: 'tapas', lib: MaterialIcons },
  [CuisineType.ASIAN]: { name: 'noodles', lib: MaterialCommunityIcons },
  [CuisineType.JAPANESE]: { name: 'noodles', lib: MaterialCommunityIcons },
  [CuisineType.INDIAN]: { name: 'rice-bowl', lib: MaterialIcons },
  [CuisineType.KEBAB]: { name: 'outdoor-grill', lib: MaterialIcons },
  [CuisineType.MEXICAN]: { name: 'taco', lib: MaterialCommunityIcons },
  [CuisineType.VEGAN]: { name: 'leaf', lib: MaterialCommunityIcons },
  [CuisineType.FUSION]: { name: 'shuffle', lib: MaterialIcons },
  [CuisineType.OTHER]: { name: 'silverware', lib: MaterialCommunityIcons }
} as const;

function getCuisineIcon(cuisine: CuisineType) {
  const icon = cuisineIconMap[cuisine] ?? cuisineIconMap.OTHER;
  const IconComponent = icon.lib as React.ComponentType<any>;
  return <IconComponent name={icon.name} style={RestaurantCardStyles.icon} />;
}

export default RestaurantCard;