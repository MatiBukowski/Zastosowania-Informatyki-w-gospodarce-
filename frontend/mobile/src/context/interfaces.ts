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
interface IRestaurantBase {
  name: string;
  address: string;
  has_kiosk: boolean;
  cuisine: CuisineType; 
  photo: string | null;
}

// restaurant data including identifier
export interface IRestaurant extends IRestaurantBase {
  restaurant_id: number;
}

export enum TableStatus {
  FREE = "FREE",
  OCCUPIED = "OCCUPIED",
  RESERVED = "RESERVED",
}

export interface ITable {
  table_id: number;
  restaurant_id: number;
  table_number: number;
  capacity: number;
  qr_code_token: string;
  status: TableStatus;
}

export interface ICreateTable {
  table_number: number;
  capacity: number;
}