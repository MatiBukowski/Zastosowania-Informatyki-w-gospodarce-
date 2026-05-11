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

    def get_menu_item_by_id(self, restaurant_id: int, menu_item_id: int) -> MenuItem | None:
        return self.db.execute(
            select(MenuItem).where(
                MenuItem.restaurant_id == restaurant_id,
                MenuItem.menu_item_id == menu_item_id,
            )
        ).scalar_one_or_none()

    def get_menu_items_by_ids(self, restaurant_id: int, menu_item_ids: list[int]) -> list[MenuItem]:
        if not menu_item_ids:
            return []
        return self.db.execute(
            select(MenuItem).where(
                MenuItem.restaurant_id == restaurant_id,
                MenuItem.menu_item_id.in_(menu_item_ids),
            )
        ).scalars().all()
