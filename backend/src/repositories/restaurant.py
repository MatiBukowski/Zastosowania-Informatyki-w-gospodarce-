from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from ..db import get_session
from ..models import Restaurant, AppUser


class RestaurantRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_restaurants_list(self, skip: int = 0, limit: int = 10):
        total = self.db.execute(select(func.count(Restaurant.restaurant_id))).scalar_one()
        items = self.db.execute(select(Restaurant).offset(skip).limit(limit)).scalars().all()
        return items, total

    def get_restaurant_by_id(self, restaurant_id: int) -> Restaurant | None:
        return self.db.execute(
            select(Restaurant).where(Restaurant.restaurant_id == restaurant_id)
        ).scalar_one_or_none()

    def get_restaurants_by_user_id(self, user_id: int, skip: int = 0, limit: int = 10):
        user = self.db.execute(
            select(AppUser).where(AppUser.user_id == user_id)
        ).scalar_one_or_none()

        if not user:
            return [], 0

        # Note: SQLAlchemy collection doesn't easily support offset/limit at the property level
        # Better to query Restaurant directly filtering by user_id if that relationship exists, 
        # but let's see how it's defined. Assuming many-to-many or many-to-one.
        # If user.managed_restaurants is a list, we can manually slice it or use a query.
        
        query = select(Restaurant).join(Restaurant.managers).where(AppUser.user_id == user_id)
        total = self.db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        items = self.db.execute(query.offset(skip).limit(limit)).scalars().all()
        
        return items, total
