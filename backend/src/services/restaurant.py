from fastapi import Depends
from ..exceptions import RestaurantNotFound
from ..repositories import RestaurantRepository

class RestaurantService:
    def __init__(self, repo: RestaurantRepository = Depends()):
        self.repo = repo

    def get_restaurants(self):
        return self.repo.get_restaurants_list()
    
    def get_restaurant(self, restaurant_id: int):
        restaurant = self.repo.get_restaurant_by_id(restaurant_id)
        if not restaurant:
            raise RestaurantNotFound(detail=f"Restaurant with id={restaurant_id} not found")
        return restaurant

    def get_restaurants_for_user(self, user_id: int):
        return self.repo.get_restaurants_by_user_id(user_id)
