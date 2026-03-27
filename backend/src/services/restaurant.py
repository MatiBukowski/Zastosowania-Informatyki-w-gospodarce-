from fastapi import Depends, HTTPException, status
from ..repositories import RestaurantRepository

class RestaurantService:
    def __init__(self, repo: RestaurantRepository = Depends()):
        self.repo = repo

    def get_restaurants(self):
        return self.repo.get_restaurants_list()
    
    def get_restaurant(self, restaurant_id: int):
        restaurant = self.repo.get_restaurant_by_id(restaurant_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Restaurant with id={restaurant_id} not found"
            )
        return restaurant
