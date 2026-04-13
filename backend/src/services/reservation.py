from fastapi import Depends
from ..repositories import ReservationRepository
from .restaurant_table import RestaurantTableService

class ReservationService:
    def __init__(
        self, 
        repo: ReservationRepository = Depends(),
        table_service: RestaurantTableService = Depends()
    ):
        self.repo = repo
        self.table_service = table_service

    def get_reservations_for_table(self, table_id: int):
        self.table_service.get_table(table_id)
        return self.repo.get_reservations_by_table_id(table_id)
