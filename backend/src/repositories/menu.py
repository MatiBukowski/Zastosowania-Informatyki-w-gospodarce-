from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from ..db import get_session
from ..models import MenuItem


class MenuRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_menu_list_for_restaurant(self, restaurant_id: int, skip: int = 0, limit: int = 10) -> tuple[list[MenuItem], int]:
        query = select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
        total = self.db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        items = self.db.execute(query.offset(skip).limit(limit)).scalars().all()
        return items, total
