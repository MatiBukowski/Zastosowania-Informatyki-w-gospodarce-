import { CuisineType } from "@/services/interfaces/interfaces";

export interface IRestaurantFilters {
  cuisine?: CuisineType[] | null;
}