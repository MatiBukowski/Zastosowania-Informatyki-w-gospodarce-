import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Image as ExpoImage } from 'expo-image';

import { IRestaurant, CuisineType } from '@/services/interfaces/interfaces';
import { theme } from '@/ui/theme/theme';

function CuisineBox({cuisine}: {cuisine: CuisineType}) {
  return (
    <View style={RestaurantCardStyles.common.cuisineBox}>
      {getCuisineIcon(cuisine)}
      <Text style={[theme.typography.body, { color: theme.colors.text, marginLeft: 4 }]}>{cuisine}</Text>
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
    router.push({
      pathname: "/tabs/restaurants/[id]",
      params: { id: restaurant.restaurant_id }
    });
    //router.push(`/restaurants/${restaurant.restaurant_id}` as any);
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
          <LocationBox address={restaurant.address} />
          <CuisineBox cuisine={restaurant.cuisine} />
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