from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..repositories import TableRepository

class TableService:
    def __init__(self, repo: TableRepository = Depends()):
        self.repo = repo

    def get_tables_for_restaurant(self, restaurant_id: int):
        tables = self.repo.get_tables_list_for_restaurant(restaurant_id)
        if not tables:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No tables found for restaurant id={restaurant_id}"
            )
        return tables
    