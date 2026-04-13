from fastapi import Depends, HTTPException, status
import uuid
from ..models import RestaurantTable, TableStatusEnum
from ..schemas import TableCreate, TableUpdate
from ..repositories import TableRepository


class TableService:
    def __init__(self, repo: TableRepository = Depends()):
        self.repo = repo

    def create_new_table(self, restaurant_id: int, table_data: TableCreate):
        existing_table = self.repo.get_table_by_number(table_data.table_number, restaurant_id)
        if existing_table:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Table number {table_data.table_number} already exists in this restaurant"
            )

        data_dict = table_data.model_dump()
        new_table = RestaurantTable(restaurant_id=restaurant_id, **data_dict)
        return self.repo.create_table(new_table)

    def update_existing_table(self, table_id: int, table_data: TableUpdate):     
        db_table = self.repo.get_table_by_id(table_id)
        if not db_table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Table doesn't exist"
            )

        if db_table.status == TableStatusEnum.OCCUPIED:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update an occupied table"
            )

        update_table_data = table_data.model_dump(exclude_unset=True)
        for key, value in update_table_data.items():
            setattr(db_table, key, value) 

        return self.repo.update_table(db_table)

    def resolve_table_by_token(self, token: uuid.UUID):
        db_table = self.repo.get_table_by_token(token)

        if not db_table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or expired QR token"
            )
            
        return db_table

    def regenerate_table_qr_code(self, table_id: int):
        new_token = uuid.uuid4()
        updated_table = self.repo.update_qr_code_token(table_id, new_token)

        if not updated_table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Table with id {table_id} not found"
            )

        return updated_table
