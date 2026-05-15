import logging

from fastapi import Depends, HTTPException, status

from src.models.enums import CuisineTypeEnum
from src.repositories import RestaurantRepository
from src.schemas import RestaurantFilters, RestaurantFilterQuery

class RestaurantService:
    def __init__(self, repo: RestaurantRepository = Depends()):
        self.logger = logging.getLogger(__name__)
        self.repo = repo

    def _parse_filters(self, filters: RestaurantFilterQuery | None) -> RestaurantFilters | None:
        if filters is None:
            return None
        return RestaurantFilters(
            cuisine = [CuisineTypeEnum(c) for c in filters.cuisine] if filters.cuisine else None
        )

    def get_restaurants(self, search: str = None, filters: RestaurantFilterQuery = None):
        filters = self._parse_filters(filters)

        if search is not None and filters is not None:
            return self.repo.get_searched_and_filtered_restaurants_list(search=search, filters=filters)
        if search is not None:
            return self.repo.get_searched_restaurants_list(search=search)
        if filters is not None:
            return self.repo.get_filtered_restaurants_list(filters=filters)
        else:
            return self.repo.get_all_restaurants()

    def get_restaurant(self, restaurant_id: int):
        restaurant = self.repo.get_restaurant_by_id(restaurant_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Restaurant with id={restaurant_id} not found"
            )
        return restaurant

    def get_restaurants_for_user(self, user_id: int):
        return self.repo.get_restaurants_by_user_id(user_id)
