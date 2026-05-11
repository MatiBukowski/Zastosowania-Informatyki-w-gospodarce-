from __future__ import annotations

from decimal import Decimal
import logging

from fastapi import Depends

from ..models import MenuItem, Order, OrderItem, OrderStatusEnum
from ..exceptions import (
    MenuItemsNotFound,
    MenuItemsUnavailable,
    NoOrderItemsProvided,
    OrderNotFound,
    OrderOriginMismatch,
    ReservationNotFound,
)
from ..repositories import MenuRepository, OrderRepository, ReservationRepository
from ..schemas import OrderCreate, OrderItemCreate, OrderUpdate
from .table import TableService


logger = logging.getLogger(__name__)


class OrderService:
    def __init__(
        self,
        repo: OrderRepository = Depends(),
        menu_repo: MenuRepository = Depends(),
        reservation_repo: ReservationRepository = Depends(),
        table_service: TableService = Depends(),
    ):
        self.repo = repo
        self.menu_repo = menu_repo
        self.reservation_repo = reservation_repo
        self.table_service = table_service

    def get_orders_for_table(self, table_id: int):
        logger.info("Listing orders for table_id=%s", table_id)
        self.table_service.validate_table_exists(table_id)
        return self.repo.get_orders_by_table_id(table_id)

    def get_order(self, order_id: int):
        logger.info("Fetching order details order_id=%s", order_id)
        order = self.repo.get_order_by_id(order_id)
        if not order:
            raise OrderNotFound(detail=f"Order with id={order_id} not found")
        return order

    def create_new_order(self, data: OrderCreate):
        logger.info(
            "Creating order restaurant_id=%s table_id=%s reservation_id=%s user_id=%s source=%s items=%s",
            data.restaurant_id,
            data.table_id,
            data.reservation_id,
            data.user_id,
            data.order_source,
            len(data.items),
        )
        if data.table_id is not None:
            table = self.table_service.validate_table_exists(data.table_id)
            if table.restaurant_id != data.restaurant_id:
                logger.warning(
                    "Order create rejected: table.restaurant_id mismatch table_id=%s table_restaurant_id=%s restaurant_id=%s",
                    data.table_id,
                    table.restaurant_id,
                    data.restaurant_id,
                )
                raise OrderOriginMismatch(
                    detail="Table belongs to a different restaurant than restaurant_id"
                )

        if data.reservation_id is not None:
            reservation = self.reservation_repo.get_reservation_by_id(data.reservation_id)
            if not reservation:
                raise ReservationNotFound(
                    detail=f"Reservation with id={data.reservation_id} not found"
                )
            if reservation.restaurant_id != data.restaurant_id:
                raise OrderOriginMismatch(
                    detail="Reservation belongs to a different restaurant than restaurant_id"
                )
            if data.table_id is not None and reservation.table_id != data.table_id:
                raise OrderOriginMismatch(
                    detail="Reservation belongs to a different table than table_id"
                )

        menu_item_ids = [item.menu_item_id for item in data.items]
        menu_items = self.menu_repo.get_menu_items_by_ids(data.restaurant_id, menu_item_ids)
        menu_by_id: dict[int, MenuItem] = {m.menu_item_id: m for m in menu_items}

        missing_ids = sorted(set(menu_item_ids) - set(menu_by_id.keys()))
        if missing_ids:
            raise MenuItemsNotFound(
                detail=f"Menu items not found for restaurant id={data.restaurant_id}: {missing_ids}"
            )

        unavailable = sorted([m.menu_item_id for m in menu_items if not m.is_available])
        if unavailable:
            raise MenuItemsUnavailable(detail=f"Menu items are not available: {unavailable}")

        total_amount = self._calculate_total(data.items, menu_by_id)

        new_order = Order(
            restaurant_id=data.restaurant_id,
            user_id=data.user_id,
            table_id=data.table_id,
            reservation_id=data.reservation_id,
            order_source=data.order_source,
            status=OrderStatusEnum.NEW,
            total_amount=total_amount,
        )

        created = self.repo.create_order(new_order)
        logger.info(
            "Order created order_id=%s restaurant_id=%s total_amount=%s",
            created.order_id,
            created.restaurant_id,
            created.total_amount,
        )

        order_items = [
            OrderItem(
                order_id=created.order_id,
                restaurant_id=created.restaurant_id,
                menu_item_id=item.menu_item_id,
                quantity=item.quantity,
                unit_price=menu_by_id[item.menu_item_id].price,
                customization_notes=item.customization_notes,
            )
            for item in data.items
        ]
        self.repo.create_order_items(order_items)
        logger.info("Order items persisted order_id=%s items=%s", created.order_id, len(order_items))

        return self.repo.get_order_by_id(created.order_id)

    def update_order(self, order_id: int, data: OrderUpdate):
        logger.info("Updating order order_id=%s data=%s", order_id, data.model_dump(exclude_unset=True))
        order = self.repo.get_order_by_id(order_id)
        if not order:
            raise OrderNotFound(detail=f"Order with id={order_id} not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(order, key, value)

        return self.repo.update_order(order)

    def add_items(self, order_id: int, items: list[OrderItemCreate]):
        if not items:
            raise NoOrderItemsProvided(detail="No items provided")

        order = self.repo.get_order_by_id(order_id)
        if not order:
            raise OrderNotFound(detail=f"Order with id={order_id} not found")

        logger.info("Adding items to order_id=%s items=%s", order_id, len(items))

        menu_item_ids = [item.menu_item_id for item in items]
        menu_items = self.menu_repo.get_menu_items_by_ids(order.restaurant_id, menu_item_ids)
        menu_by_id: dict[int, MenuItem] = {m.menu_item_id: m for m in menu_items}

        missing_ids = sorted(set(menu_item_ids) - set(menu_by_id.keys()))
        if missing_ids:
            raise MenuItemsNotFound(
                detail=f"Menu items not found for restaurant id={order.restaurant_id}: {missing_ids}"
            )

        unavailable = sorted([m.menu_item_id for m in menu_items if not m.is_available])
        if unavailable:
            raise MenuItemsUnavailable(detail=f"Menu items are not available: {unavailable}")

        delta_total = self._calculate_total(items, menu_by_id)

        new_items = [
            OrderItem(
                order_id=order.order_id,
                restaurant_id=order.restaurant_id,
                menu_item_id=item.menu_item_id,
                quantity=item.quantity,
                unit_price=menu_by_id[item.menu_item_id].price,
                customization_notes=item.customization_notes,
            )
            for item in items
        ]

        self.repo.create_order_items(new_items)
        order.total_amount = (order.total_amount or Decimal("0")) + delta_total
        self.repo.update_order(order)

        logger.info(
            "Order updated after add_items order_id=%s delta_total=%s new_total=%s",
            order.order_id,
            delta_total,
            order.total_amount,
        )

        return self.repo.get_order_by_id(order.order_id)

    @staticmethod
    def _calculate_total(items: list[OrderItemCreate], menu_by_id: dict[int, MenuItem]) -> Decimal:
        total = Decimal("0")
        for item in items:
            unit_price = menu_by_id[item.menu_item_id].price
            total += (unit_price * Decimal(item.quantity))
        return total
