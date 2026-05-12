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
  description: string | null;
}

// restaurant data including identifier
export interface IRestaurant extends IRestaurantBase {
  restaurant_id: number;
}

export enum ReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}


// post
export interface ICreateReservation {
  reservation_time: string;
  restaurant_id: number;
  table_id: number;
  user_id: number;
}

// get
export interface IReservation extends ICreateReservation {
  reservation_id: number;
  status: ReservationStatus;
}

// patch
export interface IUpdateReservation extends Partial<ICreateReservation> {
  status?: ReservationStatus;
}

export interface IMenuItem {
  name: string;
  description: string | null;
  price: string;
  menu_item_id: number;
  is_available: boolean;
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

// for login purposes
export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ILoginResponse {
    access_token: string;
    token_type: string;
}

export enum OrderSource {
  KIOSK = "KIOSK",
  WEB_APP = "WEB_APP",
  QR_TABLE = "QR_TABLE",
}

export enum OrderStatus {
  NEW = "NEW",
  PAID = "PAID",
  IN_PREPARATION = "IN_PREPARATION",
  READY = "READY",
  CANCELED = "CANCELED",
}

export interface IOrderItem {
  menu_item_id: number;
  quantity: number;
  customization_notes: string | null;
}

export interface ICreateOrder {
  restaurant_id: number;
  table_id: number | null;
  reservation_id: number | null;
  order_source: OrderSource;
  items: IOrderItem[];
}

export interface IOrder {
  order_id: number;
  restaurant_id: number;
  user_id: number | null;
  table_id: number | null;
  reservation_id: number | null;
  order_source: OrderSource;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  items: IOrderItem[];
}
