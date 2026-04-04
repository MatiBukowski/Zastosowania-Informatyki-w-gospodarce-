import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { IRestaurant, CuisineType } from '@/context/interfaces';
import { theme } from '../theme/theme';

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
        <Image style={RestaurantCardStyles.common.photobox} source={{ uri: photoUrl }} />
      ) : (
        <View style={RestaurantCardStyles.common.photobox}>
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

function RestaurantCard({ restaurant }: { restaurant: IRestaurant }) {
  return (
    <View style={theme.common.card}>
      <PhotoBox photoUrl={restaurant.photo} />
      <View style={{ flexDirection: 'column', padding: 8 }}>
        <Text style={[theme.typography.h5, { color: theme.colors.secondary }]}>{restaurant.name}</Text>
        <LocationBox address={restaurant.address} />
        <CuisineBox cuisine={restaurant.cuisine} />
      </View>
    </View>
  )
}

const RestaurantCardStyles = {
  icon: {
    fontSize: 20,
    color: theme.colors.text,
  },
  common: StyleSheet.create({
    photobox: {
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100%', 
      minHeight: 300, 
      borderWidth: 1, 
      borderColor: theme.colors.gray, 
      borderRadius: 8, 
      padding: 16
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