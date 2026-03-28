// enum for cusine types
export enum CuisineType {
  ITALIAN = "ITALIAN",
  AMERICAN = "AMERICAN",
  POLISH = "POLISH",
  MEDITERRANEAN = "MEDITERRANEAN",
  GREEK = "GREEK",
  FRENCH = "FRENCH",
  SPANISH = "SPANISH",
  ASIAN = "ASIAN",
  JAPANESE = "JAPANESE",
  INDIAN = "INDIAN",
  KEBAB = "KEBAB",
  MEXICAN = "MEXICAN",
  VEGAN = "VEGAN",
  FUSION = "FUSION",
  OTHER = "OTHER",
}

// base restaurant properties
interface RestaurantBase {
  name: string;
  address: string;
  has_kiosk: boolean;
  cuisine: CuisineType; 
  photo: string | null;
}

// restaurant data including identifier
export interface Restaurant extends RestaurantBase {
  restaurant_id: number;
}