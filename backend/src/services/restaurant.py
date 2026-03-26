from fastapi import Depends
from ..repositories import RestaurantRepository

class RestaurantService:
    def __init__(self, repo: RestaurantRepository = Depends()):
        self.repo = repo

    def get_restaurants(self):
        return self.repo.get_restaurants_list()