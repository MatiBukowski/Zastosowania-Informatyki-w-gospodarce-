from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_session
from ..models import MenuItem


class MenuRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_menu_list_for_restaurant(self, restaurant_id: int) -> list[MenuItem]:
        return self.db.execute(
            select(MenuItem).where(MenuItem.restaurant_id == restaurant_id)
        ).scalars().all()
