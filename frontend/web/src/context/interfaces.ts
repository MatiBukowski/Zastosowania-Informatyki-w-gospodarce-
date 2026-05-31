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

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY"
}

export interface IRestaurantSchedule {
  day_of_week: DayOfWeek;
  open_time: string;
  close_time: string;
}

interface IRestaurantBase {
  name: string;
  city: string;
  street: string;
  building_number: string;
  postal_code: string;
  phone_number: string;
  has_kiosk: boolean;
  cuisine: CuisineType; 
  photo: string | null;
  schedules: IRestaurantSchedule[];
}

export interface IRestaurant extends IRestaurantBase {
  restaurant_id: number;
}

export interface ISingleRestaurant extends IRestaurantBase {
  description: string;
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

export interface ITableQRProps {
  token: string;
  table_number: number;
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IForecastData {
  historical: [string, number][];
  forecast: [number[]];
  quantile_forecast: [[number[]]];
}