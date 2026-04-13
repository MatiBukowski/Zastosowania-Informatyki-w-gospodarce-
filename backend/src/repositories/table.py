from fastapi import Depends
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_session
from ..models import RestaurantTable


class TableRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_table_by_id(self, table_id: int) -> RestaurantTable | None:
        query = select(RestaurantTable).where(
            RestaurantTable.table_id == table_id
        )

        return self.db.execute(query).scalar_one_or_none()

    def get_table_by_number(self, table_number: int, restaurant_id: int) -> RestaurantTable | None:
        query = select(RestaurantTable).where(
            RestaurantTable.table_number == table_number,
            RestaurantTable.restaurant_id == restaurant_id
        )

        return self.db.execute(query).scalar_one_or_none()

    def get_table_by_token(self, token: UUID) -> RestaurantTable | None:
        query = select(RestaurantTable).where(
            RestaurantTable.qr_code_token == token
        )

        return self.db.execute(query).scalar_one_or_none()

    def create_table(self, table: RestaurantTable) -> RestaurantTable:
        self.db.add(table) 
        self.db.commit()           
        self.db.refresh(table) 
        return table

    def update_table(self, table: RestaurantTable) -> RestaurantTable:
        self.db.commit()           
        self.db.refresh(table) 
        return table

    def update_qr_code_token(self, table_id: int, new_token: UUID):
        query = select(RestaurantTable).where(
            RestaurantTable.table_id == table_id
        )
        table = self.db.execute(query).scalar_one_or_none()

        if table:
            table.qr_code_token = new_token
            self.db.commit()
            self.db.refresh(table)

        return table
