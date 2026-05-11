from __future__ import annotations

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db import get_session
from ..models import Order, OrderItem


class OrderRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_orders_by_table_id(self, table_id: int) -> list[Order]:
        return self.db.execute(
            select(Order).where(Order.table_id == table_id)
        ).scalars().all()

    def get_order_by_id(self, order_id: int) -> Order | None:
        return self.db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.order_id == order_id)
        ).scalar_one_or_none()

    def create_order(self, order: Order) -> Order:
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_order(self, order: Order) -> Order:
        self.db.commit()
        self.db.refresh(order)
        return order

    def create_order_items(self, items: list[OrderItem]) -> list[OrderItem]:
        self.db.add_all(items)
        self.db.commit()
        for item in items:
            self.db.refresh(item)
        return items
