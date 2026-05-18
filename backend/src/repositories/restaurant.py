from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from ..db import get_session
from ..models import Restaurant, AppUser


class RestaurantRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def _apply_filters(self, query, filters):
        if filters.cuisine:
            query = query.where(Restaurant.cuisine.in_(filters.cuisine))
        return query

    def get_restaurants(self, skip: int = 0, limit: int = 10, search=None, filters=None):
        totalQuery = select(func.count(Restaurant.restaurant_id))
        query = select(Restaurant)

        if search:
            query = query.where(Restaurant.name.ilike(f"%{search}%"))
            totalQuery = totalQuery.where(Restaurant.name.ilike(f"%{search}%"))
        if filters:
            query = self._apply_filters(query, filters)
            totalQuery = self._apply_filters(totalQuery, filters)
        if skip > 0:
            query = query.offset(skip)
        if limit > 0:
            query = query.limit(limit)

        total = self.db.execute(totalQuery).scalar_one()
        items = self.db.execute(query).scalars().all()
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

        query = select(Restaurant).join(Restaurant.admins).where(AppUser.user_id == user_id)
        total = self.db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        items = self.db.execute(query.offset(skip).limit(limit)).scalars().all()

        return items, total
