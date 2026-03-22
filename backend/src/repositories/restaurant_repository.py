from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_session
from ..models import Restaurant

class RestaurantRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_restaurants_list(self):
        return self.db.execute(select(Restaurant)).scalars().all()

    def get_restaurant_by_id(self, restaurant_id: int) -> Restaurant | None:
        return self.db.execute(
            select(Restaurant).where(Restaurant.restaurant_id == restaurant_id)
        ).scalar_one_or_none()