from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_session
from ..models import RestaurantTable

class RestaurantTableRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_tables_by_restaurant_id(self, restaurant_id: int):
        return self.db.execute(
            select(RestaurantTable).where(RestaurantTable.restaurant_id == restaurant_id)
        ).scalars().all()

    def get_table_by_id(self, table_id: int) -> RestaurantTable | None:
        return self.db.execute(
            select(RestaurantTable).where(RestaurantTable.table_id == table_id)
        ).scalar_one_or_none()
