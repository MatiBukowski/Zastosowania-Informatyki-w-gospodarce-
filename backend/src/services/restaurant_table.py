from fastapi import Depends, HTTPException, status
from ..repositories import RestaurantTableRepository
from .restaurant import RestaurantService

class RestaurantTableService:
    def __init__(
        self, 
        repo: RestaurantTableRepository = Depends(),
        restaurant_service: RestaurantService = Depends()
    ):
        self.repo = repo
        self.restaurant_service = restaurant_service

    def get_tables_for_restaurant(self, restaurant_id: int):
        self.restaurant_service.get_restaurant(restaurant_id)
        return self.repo.get_tables_by_restaurant_id(restaurant_id)

    def get_table(self, table_id: int):
        table = self.repo.get_table_by_id(table_id)
        if not table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Table with id={table_id} not found"
            )
        return table
