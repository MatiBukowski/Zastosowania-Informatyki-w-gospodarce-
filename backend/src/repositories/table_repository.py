from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_session
from ..models import RestaurantTable

class TableRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_tables_list_for_restaurant(self, restaurant_id: int) -> list[RestaurantTable]:
        return self.db.execute(
            select(RestaurantTable).where(RestaurantTable.restaurant_id == restaurant_id)
        ).scalars().all()