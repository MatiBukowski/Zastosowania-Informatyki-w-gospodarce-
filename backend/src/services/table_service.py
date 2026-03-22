from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..models import RestaurantTable
from ..schemas import TableResponse, TableCreate, TableUpdate
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
    
    def create_new_table(self, restaurant_id: int, table_data: TableCreate):
        data_dict = table_data.model_dump()
        new_table = RestaurantTable(**data_dict, restaurant_id=restaurant_id)
        return self.repo.create_table(new_table)
    
    def update_existing_table(self, restaurant_id: int, table_id: int, table_data: TableUpdate):     
        db_table = self.repo.get_table_by_id(table_id, restaurant_id)
        if not db_table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Table doesn't exist"
            )

        update_table_data = table_data.model_dump(exclude_unset=True)
        for key, value in update_table_data.items():
            setattr(db_table, key, value) 
        
        return self.repo.update_table(db_table)