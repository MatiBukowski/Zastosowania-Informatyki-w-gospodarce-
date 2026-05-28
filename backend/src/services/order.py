from fastapi import Depends, HTTPException, status
from typing import Optional
from decimal import Decimal
from datetime import datetime
import math

from ..models import Order, OrderItem, MenuItem, RestaurantTable, Reservation, UserRoleEnum, OrderStatusEnum, TableStatusEnum, ReservationStatusEnum, AppUser, OrderSourceEnum
from ..schemas import OrderCreate, OrderUpdate, PaginatedResponse
from ..repositories import OrderRepository, RestaurantRepository, TableRepository, ReservationRepository, MenuRepository


class OrderService:
    def __init__(
        self,
        repo: OrderRepository = Depends(),
        restaurant_repo: RestaurantRepository = Depends(),
        table_repo: TableRepository = Depends(),
        reservation_repo: ReservationRepository = Depends(),
        menu_repo: MenuRepository = Depends()
    ):
        self.repo = repo
        self.restaurant_repo = restaurant_repo
        self.table_repo = table_repo
        self.reservation_repo = reservation_repo
        self.menu_repo = menu_repo

    def create_new_order(
        self,
        order_data: OrderCreate,
        current_user: Optional[AppUser] = None,
        current_user_id: Optional[int] = None
    ) -> Order:
        if current_user_id is None and current_user is not None:
            current_user_id = current_user.user_id

        if order_data.order_source != OrderSourceEnum.KIOSK and current_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to place orders via this source"
            )

        is_staff = current_user.role in [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.WAITER] if current_user else False

        if order_data.order_source == OrderSourceEnum.QR_TABLE and order_data.table_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="QR_TABLE order source requires a table_id"
            )

        restaurant = self.restaurant_repo.get_restaurant_by_id(order_data.restaurant_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Restaurant with id {order_data.restaurant_id} not found"
            )

        if order_data.table_id is not None:
            table = self.table_repo.get_table_by_id(order_data.table_id)
            if not table or table.restaurant_id != order_data.restaurant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Table with id {order_data.table_id} does not exist in restaurant {order_data.restaurant_id}"
                )

            if table.status == TableStatusEnum.OCCUPIED:
                active_orders = self.repo.get_active_orders_for_table(order_data.table_id)

                if active_orders:
                    is_same_user = any(current_user_id is not None and o.user_id == current_user_id for o in active_orders)

                    if not (is_staff or is_same_user):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="This table is currently occupied by another active session"
                        )

            now = datetime.now()
            from datetime import timedelta
            window_start = now - timedelta(hours=2)
            window_end = now + timedelta(hours=2)
            active_res = self.reservation_repo.db.query(Reservation).filter(
                Reservation.table_id == order_data.table_id,
                Reservation.status == ReservationStatusEnum.CONFIRMED,
                Reservation.reservation_time >= window_start,
                Reservation.reservation_time <= window_end
            ).first()

            if active_res:
                if current_user_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="This table is currently reserved. Anonymous users cannot place orders on reserved tables."
                    )
                if order_data.reservation_id != active_res.reservation_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="This table is currently reserved. You must provide the matching reservation_id to place an order."
                    )



        if order_data.reservation_id is not None:
            res = self.reservation_repo.get_reservation_by_id(order_data.reservation_id)
            if not res or res.restaurant_id != order_data.restaurant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Reservation with id {order_data.reservation_id} does not exist in restaurant {order_data.restaurant_id}"
                )

            if order_data.table_id is not None and res.table_id != order_data.table_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The provided table_id does not match the reservation table_id"
                )
            
            if current_user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Anonymous orders cannot be linked to any reservation"
                )
            elif res.user_id != current_user_id and not is_staff:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This reservation belongs to another customer"
                )
                
            if res.status == ReservationStatusEnum.CANCELED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot place order for a canceled reservation"
                )

            from datetime import timedelta
            now = datetime.now()
            if not (res.reservation_time - timedelta(hours=2) <= now <= res.reservation_time + timedelta(hours=2)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot link order to a reservation outside of the 2-hour window"
                )

        if not order_data.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order must contain at least one item"
            )

        total_amount = Decimal("0.00")
        items_to_create = []

        for item_data in order_data.items:
            mi = self.menu_repo.db.query(MenuItem).filter(MenuItem.menu_item_id == item_data.menu_item_id).first()
            if not mi or mi.restaurant_id != order_data.restaurant_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Menu item with id {item_data.menu_item_id} not found in restaurant {order_data.restaurant_id}"
                )
            if not mi.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Menu item '{mi.name}' is currently not available"
                )

            item_total = mi.price * item_data.quantity
            total_amount += item_total

            db_item = OrderItem(
                menu_item_id=item_data.menu_item_id,
                quantity=item_data.quantity,
                unit_price=mi.price,
                customization_notes=item_data.customization_notes
            )
            items_to_create.append(db_item)

        new_order = Order(
            restaurant_id=order_data.restaurant_id,
            user_id=current_user_id,
            table_id=order_data.table_id,
            reservation_id=order_data.reservation_id,
            order_source=order_data.order_source,
            status=OrderStatusEnum.NEW,
            total_amount=total_amount,
            created_at=datetime.now()
        )

        created_order = self.repo.create_order(new_order, items_to_create)
        created_order.items = self.repo.get_order_items(created_order.order_id)
        return created_order

    def get_order(self, order_id: int, current_user: AppUser) -> Order:
        order = self.repo.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )

        is_staff = current_user.role in [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.WAITER]
        is_owner = order.user_id == current_user.user_id

        if not (is_staff or is_owner):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this order"
            )

        order.items = self.repo.get_order_items(order_id)
        return order

    def update_order(self, order_id: int, data: OrderUpdate, current_user: AppUser) -> Order:
        order = self.repo.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )

        is_staff = current_user.role in [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.WAITER]

        if data.status is not None:
            if data.status == OrderStatusEnum.CANCELED:
                is_owner = order.user_id == current_user.user_id
                if order.status == OrderStatusEnum.CANCELED:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Order is already canceled"
                    )
                if is_staff:
                    pass
                elif is_owner:
                    if order.status != OrderStatusEnum.NEW:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Cannot cancel order with status '{order.status.value}'. Only 'NEW' orders can be canceled by customers."
                        )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You do not have permission to cancel this order"
                    )
            else:
                if not is_staff:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Only staff members can update order status"
                    )

                valid_transitions = {
                    OrderStatusEnum.NEW: [OrderStatusEnum.PAID],
                    OrderStatusEnum.PAID: [OrderStatusEnum.IN_PREPARATION],
                    OrderStatusEnum.IN_PREPARATION: [OrderStatusEnum.READY],
                    OrderStatusEnum.READY: [],
                    OrderStatusEnum.CANCELED: []
                }

                if data.status not in valid_transitions.get(order.status, []):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid status transition from {order.status.value} to {data.status.value}"
                    )

            order.status = data.status

            if order.status in [OrderStatusEnum.PAID, OrderStatusEnum.IN_PREPARATION] and order.table_id is not None:
                table = self.table_repo.get_table_by_id(order.table_id)
                if table:
                    table.status = TableStatusEnum.OCCUPIED
                    self.table_repo.update_table(table)

            if order.status in [OrderStatusEnum.CANCELED, OrderStatusEnum.READY] and order.table_id is not None:
                has_active = self.repo.has_active_orders_for_table(order.table_id, order.order_id)
                if not has_active:
                    table = self.table_repo.get_table_by_id(order.table_id)
                    if table and table.status == TableStatusEnum.OCCUPIED:
                        table.status = TableStatusEnum.FREE
                        self.table_repo.update_table(table)

        updated_order = self.repo.update_order(order)
        updated_order.items = self.repo.get_order_items(order_id)
        return updated_order

    def get_orders_for_user(self, user_id: int, skip: int = 0, limit: int = 10, page: int = 1, size: int = 10):
        items, total = self.repo.get_orders_by_user_id(user_id, skip, limit)
        items_map = self.repo.get_orders_with_items([order.order_id for order in items])
        for order in items:
            order.items = items_map.get(order.order_id, [])
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size) if size > 0 else 1
        )

    def get_orders_for_restaurant(self, restaurant_id: int, current_user: AppUser, skip: int = 0, limit: int = 10, page: int = 1, size: int = 10):
        
        if current_user.role == UserRoleEnum.CUSTOMER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions to access this restaurant's orders."
            )
        elif current_user.role in [UserRoleEnum.MANAGER, UserRoleEnum.WAITER]:
            if not self.restaurant_repo.is_staff_member(restaurant_id, current_user.user_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have enough permissions to access this restaurant's orders."
                )

        items, total = self.repo.get_orders_by_restaurant_id(restaurant_id, skip, limit)
        items_map = self.repo.get_orders_with_items([order.order_id for order in items])
        for order in items:
            order.items = items_map.get(order.order_id, [])
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size) if size > 0 else 1
        )
