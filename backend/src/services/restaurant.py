from fastapi import Depends, HTTPException, status
from ..repositories import RestaurantRepository
from ..schemas import RestaurantFilters

class RestaurantService:
    def __init__(self, repo: RestaurantRepository = Depends()):
        self.repo = repo

    def get_restaurants(self, search: str = None, filters: RestaurantFilters = None):
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
