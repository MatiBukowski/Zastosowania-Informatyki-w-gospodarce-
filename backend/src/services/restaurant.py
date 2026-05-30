import logging
import math
from fastapi import Depends, HTTPException, status

from src.models.enums import CuisineTypeEnum
from src.models import RestaurantSchedule
from src.repositories import RestaurantRepository
from src.schemas import (
    RestaurantFilters,
    RestaurantFilterQuery,
    PaginatedResponse,
    UpdateSingleRestaurante
)

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

    def get_restaurants(
            self,
            skip: int = 0,
            limit: int = 10,
            page: int = 1,
            size: int = 10,
            search: str = None,
            filters: RestaurantFilterQuery = None
    ):
        filters = self._parse_filters(filters)

        items, total = self.repo.get_restaurants(
            skip=skip,
            limit=limit,
            search=search,
            filters=filters)
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size) if size > 0 else 1
        )

    def get_restaurant(self, restaurant_id: int):
        restaurant = self.repo.get_restaurant_by_id(restaurant_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Restaurant with id={restaurant_id} not found"
            )
        return restaurant

    def get_restaurants_for_user(self, user_id: int, skip: int = 0, limit: int = 10, page: int = 1, size: int = 10):
        items, total = self.repo.get_restaurants_by_user_id(user_id, skip, limit)
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size) if size > 0 else 1
        )

    def patch_restaurant(self, restaurant_id: int, restaurant_data: UpdateSingleRestaurante):
        restaurant = self.repo.get_restaurant_by_id(restaurant_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Restaurant with id={restaurant_id} not found"
            )

        if isinstance(restaurant_data, dict):
            updated_restaurant_data = restaurant_data
        else:
            updated_restaurant_data = restaurant_data.model_dump(exclude_unset=True)

        schedules_data = updated_restaurant_data.pop("schedules", None)

        for key, value in updated_restaurant_data.items():
            setattr(restaurant, key, value)

        if schedules_data is not None:
            new_schedules = []

            for sched_dict in schedules_data:
                new_schedule = RestaurantSchedule(**sched_dict)
                new_schedule.restaurant_id = restaurant_id
                new_schedules.append(new_schedule)

            restaurant.schedules = new_schedules

        return self.repo.update_restaurant(restaurant)
