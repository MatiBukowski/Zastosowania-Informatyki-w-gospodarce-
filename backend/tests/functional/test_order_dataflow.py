from decimal import Decimal

from tests.utils import create_restaurants, create_user, create_tables, create_menu
from src.models import OrderSourceEnum, OrderStatusEnum


class TestOrderDataflow:

    def test_order_lifecycle_for_table(self, client, db):
        create_restaurants(db)
        create_user(db)
        create_tables(db, restaurant_id=1)
        create_menu(db)

        table_id = 1

        payload = {
            "restaurant_id": 1,
            "user_id": 1,
            "order_source": OrderSourceEnum.QR_TABLE,
            "items": [
                {"menu_item_id": 1, "quantity": 2, "customization_notes": "no onions"},
            ],
        }

        response = client.post(f"/api/tables/{table_id}/orders", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["table_id"] == table_id
        assert data["restaurant_id"] == 1
        assert data["status"] == OrderStatusEnum.NEW
        assert len(data["items"]) == 1
        assert data["items"][0]["menu_item_id"] == 1
        assert data["items"][0]["quantity"] == 2

        total_amount = Decimal(str(data["total_amount"]))
        assert total_amount == Decimal("63.98")

        order_id = data["order_id"]

        response = client.get(f"/api/orders/{order_id}")
        assert response.status_code == 200
        assert response.json()["order_id"] == order_id
        assert len(response.json()["items"]) == 1

        response = client.post(
            f"/api/orders/{order_id}/items",
            json=[{"menu_item_id": 1, "quantity": 1, "customization_notes": None}],
        )
        assert response.status_code == 200
        data = response.json()
        assert Decimal(str(data["total_amount"])) == Decimal("95.97")
        assert len(data["items"]) == 2

        response = client.patch(
            f"/api/orders/{order_id}",
            json={"status": OrderStatusEnum.PAID},
        )
        assert response.status_code == 200
        assert response.json()["status"] == OrderStatusEnum.PAID

    def test_order_not_found(self, client, db):
        response = client.get("/api/orders/99999")
        assert response.status_code == 404
