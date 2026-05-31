from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from ..db import get_session
from ..models import Order, OrderItem


class OrderRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def create_order(self, order: Order, items: list[OrderItem]) -> Order:
        try:
            self.db.add(order)
            self.db.flush()
            for item in items:
                item.order_id = order.order_id
                item.restaurant_id = order.restaurant_id
                self.db.add(item)
            self.db.commit()
            self.db.refresh(order)
            return order
        except Exception:
            self.db.rollback()
            raise

    def get_order_by_id(self, order_id: int) -> Order | None:
        return self.db.execute(
            select(Order).where(Order.order_id == order_id)
        ).scalar_one_or_none()

    def get_order_items(self, order_id: int) -> list[OrderItem]:
        return list(
            self.db.execute(
                select(OrderItem).where(OrderItem.order_id == order_id)
            ).scalars().all()
        )

    def get_orders_with_items(self, order_ids: list[int]) -> dict[int, list[OrderItem]]:
        if not order_ids:
            return {}
        all_items = list(
            self.db.execute(
                select(OrderItem).where(OrderItem.order_id.in_(order_ids))
            ).scalars().all()
        )
        result: dict[int, list[OrderItem]] = {oid: [] for oid in order_ids}
        for item in all_items:
            result[item.order_id].append(item)
        return result

    def update_order(self, order: Order) -> Order:
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_orders_by_user_id(self, user_id: int, skip: int = 0, limit: int = 10) -> tuple[list[Order], int]:
        query = select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
        total = self.db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        items = self.db.execute(query.offset(skip).limit(limit)).scalars().all()
        return list(items), total

    def get_orders_by_restaurant_id(self, restaurant_id: int, skip: int = 0, limit: int = 10) -> tuple[list[Order], int]:
        query = select(Order).where(Order.restaurant_id == restaurant_id).order_by(Order.created_at.desc())
        total = self.db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        items = self.db.execute(query.offset(skip).limit(limit)).scalars().all()
        return list(items), total

    def has_active_orders_for_table(self, table_id: int, exclude_order_id: int) -> bool:
        from ..models.enums import OrderStatusEnum
        return self.db.execute(
            select(func.count(Order.order_id))
            .where(
                Order.table_id == table_id,
                Order.status.in_([OrderStatusEnum.NEW, OrderStatusEnum.PAID, OrderStatusEnum.IN_PREPARATION]),
                Order.order_id != exclude_order_id
            )
        ).scalar() > 0

    def get_active_orders_for_table(self, table_id: int) -> list[Order]:
        from ..models.enums import OrderStatusEnum
        return list(
            self.db.execute(
                select(Order)
                .where(
                    Order.table_id == table_id,
                    Order.status.in_([OrderStatusEnum.NEW, OrderStatusEnum.PAID, OrderStatusEnum.IN_PREPARATION])
                )
                .order_by(Order.created_at.asc())
            ).scalars().all()
        )
