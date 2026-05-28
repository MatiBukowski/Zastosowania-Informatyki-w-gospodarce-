import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException, status
from decimal import Decimal

from src.services.order import OrderService
from src.schemas.order import OrderCreate, OrderItemCreate, OrderUpdate
from src.models import Order, MenuItem, RestaurantTable, Reservation, OrderSourceEnum, OrderStatusEnum, UserRoleEnum, ReservationStatusEnum, TableStatusEnum

class TestOrderService:

    def test_create_order_success_calculates_correct_amount(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = MagicMock(restaurant_id=1)
        
        mock_menu_item = MenuItem(
            menu_item_id=1,
            restaurant_id=1,
            name="Dish 1",
            price=Decimal("15.50"),
            is_available=True
        )
        mock_menu_repo.db.query.return_value.filter.return_value.first.return_value = mock_menu_item

        def mock_create(order, items):
            order.order_id = 123
            return order
        mock_repo.create_order.side_effect = mock_create
        mock_repo.get_order_items.return_value = []

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=1,
            table_id=None,
            reservation_id=None,
            order_source=OrderSourceEnum.KIOSK,
            items=[
                OrderItemCreate(menu_item_id=1, quantity=2, customization_notes="No sauce")
            ]
        )

        result = service.create_new_order(order_data, current_user_id=1)

        assert result.order_id == 123
        assert result.total_amount == Decimal("31.00")
        mock_repo.create_order.assert_called_once()
        mock_menu_repo.db.query.assert_called_once_with(MenuItem)

    def test_create_order_reservation_hijack_raises_403(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = MagicMock(restaurant_id=1)
        
        mock_res = Reservation(
            reservation_id=10,
            restaurant_id=1,
            user_id=99,
            status=ReservationStatusEnum.PENDING
        )
        mock_reservation_repo.get_reservation_by_id.return_value = mock_res

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=1,
            table_id=None,
            reservation_id=10,
            order_source=OrderSourceEnum.WEB_APP,
            items=[
                OrderItemCreate(menu_item_id=1, quantity=1)
            ]
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_order(order_data, current_user_id=1)

        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
        assert "This reservation belongs to another customer" in exc_info.value.detail

    def test_get_order_bola_protection_raises_403(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_order = Order(
            order_id=1,
            user_id=5,
            status=OrderStatusEnum.NEW
        )
        mock_repo.get_order_by_id.return_value = mock_order

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        mock_user = MagicMock(user_id=6, role=UserRoleEnum.CUSTOMER)

        with pytest.raises(HTTPException) as exc_info:
            service.get_order(order_id=1, current_user=mock_user)

        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
        assert "You do not have permission to view this order" in exc_info.value.detail

    def test_update_order_status_valid_transition(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_order = Order(
            order_id=1,
            user_id=5,
            status=OrderStatusEnum.NEW,
            table_id=2
        )
        mock_repo.get_order_by_id.return_value = mock_order
        mock_repo.update_order.side_effect = lambda x: x
        mock_repo.get_order_items.return_value = []

        mock_table = RestaurantTable(table_id=2, status=TableStatusEnum.FREE)
        mock_table_repo.get_table_by_id.return_value = mock_table

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        mock_staff = MagicMock(user_id=10, role=UserRoleEnum.WAITER)
        update_data = OrderUpdate(status=OrderStatusEnum.PAID)

        result = service.update_order(order_id=1, data=update_data, current_user=mock_staff)

        assert result.status == OrderStatusEnum.PAID
        assert mock_table.status == TableStatusEnum.OCCUPIED
        mock_repo.update_order.assert_called_once()
        mock_table_repo.update_table.assert_called_once_with(mock_table)

    def test_create_order_empty_items_raises_400(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = MagicMock(restaurant_id=1)

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=1,
            table_id=None,
            reservation_id=None,
            order_source=OrderSourceEnum.KIOSK,
            items=[]
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_order(order_data, current_user_id=1)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "at least one item" in exc_info.value.detail

    def test_create_order_menu_item_wrong_restaurant_raises_404(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = MagicMock(restaurant_id=1)

        mock_mi = MenuItem(
            menu_item_id=5,
            restaurant_id=2,
            name="Foreign Dish",
            price=Decimal("10.00"),
            is_available=True
        )
        mock_menu_repo.db.query.return_value.filter.return_value.first.return_value = mock_mi

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=1,
            table_id=None,
            reservation_id=None,
            order_source=OrderSourceEnum.KIOSK,
            items=[OrderItemCreate(menu_item_id=5, quantity=1)]
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_order(order_data, current_user_id=1)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "not found in restaurant" in exc_info.value.detail

    def test_create_order_unavailable_menu_item_raises_400(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = MagicMock(restaurant_id=1)

        mock_mi = MenuItem(
            menu_item_id=1,
            restaurant_id=1,
            name="Sold Out Dish",
            price=Decimal("20.00"),
            is_available=False
        )
        mock_menu_repo.db.query.return_value.filter.return_value.first.return_value = mock_mi

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=1,
            table_id=None,
            reservation_id=None,
            order_source=OrderSourceEnum.KIOSK,
            items=[OrderItemCreate(menu_item_id=1, quantity=1)]
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_order(order_data, current_user_id=1)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "not available" in exc_info.value.detail

    def test_create_order_restaurant_not_found_raises_404(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = None

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=999,
            table_id=None,
            reservation_id=None,
            order_source=OrderSourceEnum.KIOSK,
            items=[OrderItemCreate(menu_item_id=1, quantity=1)]
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_order(order_data, current_user_id=1)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Restaurant with id 999 not found" in exc_info.value.detail

    def test_create_order_table_wrong_restaurant_raises_400(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = MagicMock(restaurant_id=1)

        mock_table = RestaurantTable(table_id=10, restaurant_id=2)
        mock_table_repo.get_table_by_id.return_value = mock_table

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=1,
            table_id=10,
            reservation_id=None,
            order_source=OrderSourceEnum.QR_TABLE,
            items=[OrderItemCreate(menu_item_id=1, quantity=1)]
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_order(order_data, current_user_id=1)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "does not exist in restaurant" in exc_info.value.detail

    def test_create_order_canceled_reservation_raises_400(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = MagicMock(restaurant_id=1)

        mock_res = Reservation(
            reservation_id=10,
            restaurant_id=1,
            user_id=1,
            status=ReservationStatusEnum.CANCELED
        )
        mock_reservation_repo.get_reservation_by_id.return_value = mock_res

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=1,
            table_id=None,
            reservation_id=10,
            order_source=OrderSourceEnum.WEB_APP,
            items=[OrderItemCreate(menu_item_id=1, quantity=1)]
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_order(order_data, current_user_id=1)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "canceled reservation" in exc_info.value.detail

    def test_update_order_invalid_transition_raises_400(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_order = Order(
            order_id=1,
            user_id=5,
            status=OrderStatusEnum.READY
        )
        mock_repo.get_order_by_id.return_value = mock_order

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        mock_staff = MagicMock(user_id=10, role=UserRoleEnum.ADMIN)
        update_data = OrderUpdate(status=OrderStatusEnum.NEW)

        with pytest.raises(HTTPException) as exc_info:
            service.update_order(order_id=1, data=update_data, current_user=mock_staff)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid status transition" in exc_info.value.detail

    def test_update_order_customer_cannot_change_status_raises_403(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_order = Order(
            order_id=1,
            user_id=5,
            status=OrderStatusEnum.NEW
        )
        mock_repo.get_order_by_id.return_value = mock_order

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        mock_customer = MagicMock(user_id=5, role=UserRoleEnum.CUSTOMER)
        update_data = OrderUpdate(status=OrderStatusEnum.PAID)

        with pytest.raises(HTTPException) as exc_info:
            service.update_order(order_id=1, data=update_data, current_user=mock_customer)

        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
        assert "Only staff members" in exc_info.value.detail

    def test_update_order_cancel_non_new_by_customer_raises_400(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_order = Order(
            order_id=1,
            user_id=5,
            status=OrderStatusEnum.PAID
        )
        mock_repo.get_order_by_id.return_value = mock_order

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        mock_customer = MagicMock(user_id=5, role=UserRoleEnum.CUSTOMER)
        update_data = OrderUpdate(status=OrderStatusEnum.CANCELED)

        with pytest.raises(HTTPException) as exc_info:
            service.update_order(order_id=1, data=update_data, current_user=mock_customer)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_order_not_found_raises_404(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_repo.get_order_by_id.return_value = None

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        mock_user = MagicMock(user_id=1, role=UserRoleEnum.CUSTOMER)

        with pytest.raises(HTTPException) as exc_info:
            service.get_order(order_id=9999, current_user=mock_user)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Order with id 9999 not found" in exc_info.value.detail

    def test_create_order_anonymous_non_kiosk_raises_401(self):
        mock_repo = MagicMock()
        mock_restaurant_repo = MagicMock()
        mock_table_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_menu_repo = MagicMock()

        mock_restaurant_repo.get_restaurant_by_id.return_value = MagicMock(restaurant_id=1)

        service = OrderService(
            repo=mock_repo,
            restaurant_repo=mock_restaurant_repo,
            table_repo=mock_table_repo,
            reservation_repo=mock_reservation_repo,
            menu_repo=mock_menu_repo
        )

        order_data = OrderCreate(
            restaurant_id=1,
            table_id=None,
            reservation_id=None,
            order_source=OrderSourceEnum.WEB_APP,
            items=[OrderItemCreate(menu_item_id=1, quantity=1)]
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_order(order_data, current_user_id=None)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Authentication required" in exc_info.value.detail
