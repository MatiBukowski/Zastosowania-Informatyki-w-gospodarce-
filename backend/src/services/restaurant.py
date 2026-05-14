import math
from fastapi import Depends, HTTPException, status
from ..repositories import RestaurantRepository
from ..schemas import PaginatedResponse

class RestaurantService:
    def __init__(self, repo: RestaurantRepository = Depends()):
        self.repo = repo

    def get_restaurants(self, skip: int = 0, limit: int = 10, page: int = 1, size: int = 10):
        items, total = self.repo.get_restaurants_list(skip, limit)
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
