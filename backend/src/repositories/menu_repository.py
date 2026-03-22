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
    
    def get_menu_item_by_id(self, menu_item_id: int, restaurant_id: int) -> MenuItem | None:
        query = select(MenuItem).where(
            MenuItem.menu_item_id == menu_item_id,
            MenuItem.restaurant_id == restaurant_id
        )
        
        return self.db.execute(query).scalar_one_or_none()
    
    def create_item(self, menu_item: MenuItem) -> MenuItem:
        self.db.add(menu_item) 
        self.db.commit()           
        self.db.refresh(menu_item) 
        return menu_item
    
    def update_item(self, menu_item: MenuItem) -> MenuItem:
        self.db.commit()           
        self.db.refresh(menu_item) 
        return menu_item