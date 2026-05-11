import pytest
from unittest.mock import MagicMock
from decimal import Decimal

from src.exceptions import OrderNotFound

from src.services import OrderService
from src.schemas import OrderCreate, OrderItemCreate, OrderUpdate
from src.models import MenuItem, Order, OrderItem, OrderSourceEnum, OrderStatusEnum


class TestOrderService:

    def test_get_orders_for_table_success(self):
        mock_repo = MagicMock()
        mock_menu_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_table_service = MagicMock()

        service = OrderService(
            repo=mock_repo,
            menu_repo=mock_menu_repo,
            reservation_repo=mock_reservation_repo,
            table_service=mock_table_service,
        )

        table_id = 1
        mock_orders = [MagicMock(spec=Order), MagicMock(spec=Order)]
        mock_repo.get_orders_by_table_id.return_value = mock_orders

        result = service.get_orders_for_table(table_id)

        assert result == mock_orders
        mock_table_service.validate_table_exists.assert_called_once_with(table_id)
        mock_repo.get_orders_by_table_id.assert_called_once_with(table_id)

    def test_get_order_not_found_raises_404(self):
        mock_repo = MagicMock()
        mock_repo.get_order_by_id.return_value = None

        service = OrderService(
            repo=mock_repo,
            menu_repo=MagicMock(),
            reservation_repo=MagicMock(),
            table_service=MagicMock(),
        )

        with pytest.raises(OrderNotFound) as exc_info:
            service.get_order(order_id=999)
        assert "Order with id=999 not found" in exc_info.value.detail

    def test_create_order_success_calculates_total_and_persists(self):
        mock_repo = MagicMock()
        mock_menu_repo = MagicMock()
        mock_reservation_repo = MagicMock()
        mock_table_service = MagicMock()

        service = OrderService(
            repo=mock_repo,
            menu_repo=mock_menu_repo,
            reservation_repo=mock_reservation_repo,
            table_service=mock_table_service,
        )

        mock_table_service.validate_table_exists.return_value = MagicMock(restaurant_id=1)

        menu_item_1 = MenuItem(menu_item_id=1, restaurant_id=1, name="A", description=None, price=Decimal("10.00"), is_available=True)
        menu_item_2 = MenuItem(menu_item_id=2, restaurant_id=1, name="B", description=None, price=Decimal("2.50"), is_available=True)
        mock_menu_repo.get_menu_items_by_ids.return_value = [menu_item_1, menu_item_2]

        created_order = Order(
            order_id=123,
            restaurant_id=1,
            user_id=1,
            table_id=1,
            reservation_id=None,
            order_source=OrderSourceEnum.QR_TABLE,
            status=OrderStatusEnum.NEW,
            total_amount=Decimal("12.50"),
        )
        mock_repo.create_order.return_value = created_order
        mock_repo.get_order_by_id.return_value = created_order

        data = OrderCreate(
            restaurant_id=1,
            user_id=1,
            table_id=1,
            reservation_id=None,
            order_source=OrderSourceEnum.QR_TABLE,
            items=[
                OrderItemCreate(menu_item_id=1, quantity=1, customization_notes=None),
                OrderItemCreate(menu_item_id=2, quantity=1, customization_notes=None),
            ],
        )

        result = service.create_new_order(data)

        assert result == created_order
        mock_repo.create_order.assert_called_once()
        mock_repo.create_order_items.assert_called_once()

        created_arg: Order = mock_repo.create_order.call_args.args[0]
        assert created_arg.total_amount == Decimal("12.50")

    def test_add_items_updates_total(self):
        mock_repo = MagicMock()
        mock_menu_repo = MagicMock()

        existing = Order(
            order_id=1,
            restaurant_id=1,
            user_id=None,
            table_id=1,
            reservation_id=None,
            order_source=OrderSourceEnum.QR_TABLE,
            status=OrderStatusEnum.NEW,
            total_amount=Decimal("10.00"),
        )
        mock_repo.get_order_by_id.return_value = existing

        menu_item = MenuItem(menu_item_id=1, restaurant_id=1, name="A", description=None, price=Decimal("2.50"), is_available=True)
        mock_menu_repo.get_menu_items_by_ids.return_value = [menu_item]

        service = OrderService(
            repo=mock_repo,
            menu_repo=mock_menu_repo,
            reservation_repo=MagicMock(),
            table_service=MagicMock(),
        )

        service.add_items(1, [OrderItemCreate(menu_item_id=1, quantity=2, customization_notes=None)])

        assert existing.total_amount == Decimal("15.00")
        mock_repo.create_order_items.assert_called_once()
        mock_repo.update_order.assert_called_once_with(existing)

    def test_update_order_not_found_raises_404(self):
        mock_repo = MagicMock()
        mock_repo.get_order_by_id.return_value = None

        service = OrderService(
            repo=mock_repo,
            menu_repo=MagicMock(),
            reservation_repo=MagicMock(),
            table_service=MagicMock(),
        )

        with pytest.raises(OrderNotFound) as exc_info:
            service.update_order(1, OrderUpdate(status=OrderStatusEnum.PAID))
        assert "Order with id=1 not found" in exc_info.value.detail

    def test_update_order_status_success(self):
        mock_repo = MagicMock()
        existing = Order(
            order_id=1,
            restaurant_id=1,
            user_id=None,
            table_id=1,
            reservation_id=None,
            order_source=OrderSourceEnum.QR_TABLE,
            status=OrderStatusEnum.NEW,
            total_amount=Decimal("0"),
        )
        mock_repo.get_order_by_id.return_value = existing
        mock_repo.update_order.return_value = existing

        service = OrderService(
            repo=mock_repo,
            menu_repo=MagicMock(),
            reservation_repo=MagicMock(),
            table_service=MagicMock(),
        )

        updated = service.update_order(1, OrderUpdate(status=OrderStatusEnum.PAID))

        assert updated.status == OrderStatusEnum.PAID
        mock_repo.update_order.assert_called_once_with(existing)
