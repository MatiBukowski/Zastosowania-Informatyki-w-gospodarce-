from tests.utils import create_restaurants, create_menu, create_tables, create_user, get_table_for_restaurant, get_menu_item_for_restaurant, assign_user_to_restaurant
from src.models import AppUser, UserRoleEnum, Restaurant, Reservation, ReservationStatusEnum
from src.security import PasswordHandler
from datetime import datetime

class TestOrderDataflow:

    def test_order_lifecycle_anonymous_dataflow(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)
        create_tables(db, restaurant.restaurant_id)

        table = get_table_for_restaurant(db, restaurant.restaurant_id)
        menu_item = get_menu_item_for_restaurant(db, restaurant.restaurant_id)

        qr_payload = {
            "restaurant_id": restaurant.restaurant_id,
            "table_id": table.table_id,
            "reservation_id": None,
            "order_source": "QR_TABLE",
            "items": [
                {
                    "menu_item_id": menu_item.menu_item_id,
                    "quantity": 1
                }
            ]
        }
        qr_response = client.post("/api/orders", json=qr_payload)
        assert qr_response.status_code == 401

        kiosk_payload = {
            "restaurant_id": restaurant.restaurant_id,
            "table_id": None,
            "reservation_id": None,
            "order_source": "KIOSK",
            "items": [
                {
                    "menu_item_id": menu_item.menu_item_id,
                    "quantity": 2,
                    "customization_notes": "No pepper"
                }
            ]
        }

        create_response = client.post("/api/orders", json=kiosk_payload)
        assert create_response.status_code == 201

        created_data = create_response.json()
        assert created_data["order_id"] is not None
        assert created_data["status"] == "NEW"
        assert created_data["total_amount"] == "63.98"
        assert len(created_data["items"]) == 1
        assert created_data["items"][0]["menu_item_id"] == menu_item.menu_item_id
        assert created_data["items"][0]["quantity"] == 2
        assert created_data["items"][0]["unit_price"] == "31.99"

        order_id = created_data["order_id"]

        get_response = client.get(f"/api/orders/{order_id}")
        assert get_response.status_code == 401

    def test_order_lifecycle_authenticated_and_bola_dataflow(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)
        create_tables(db, restaurant.restaurant_id)

        table = get_table_for_restaurant(db, restaurant.restaurant_id)
        menu_item = get_menu_item_for_restaurant(db, restaurant.restaurant_id)

        user_a = create_user(db)
        
        register_response = client.post("/api/auth/register", json={
            "email": "user_b@example.com",
            "password": "password123",
            "first_name": "Jane",
            "surname": "Doe"
        })
        assert register_response.status_code == 201
        token_b = register_response.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        token_a = login_response.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        create_payload = {
            "restaurant_id": restaurant.restaurant_id,
            "table_id": table.table_id,
            "reservation_id": None,
            "order_source": "QR_TABLE",
            "items": [
                {
                    "menu_item_id": menu_item.menu_item_id,
                    "quantity": 1,
                    "customization_notes": "None"
                }
            ]
        }

        create_response = client.post("/api/orders", json=create_payload, headers=headers_a)
        assert create_response.status_code == 201
        created_data = create_response.json()
        assert created_data["user_id"] == user_a.user_id

        order_id = created_data["order_id"]

        get_response_a = client.get(f"/api/orders/{order_id}", headers=headers_a)
        assert get_response_a.status_code == 200

        get_response_b = client.get(f"/api/orders/{order_id}", headers=headers_b)
        assert get_response_b.status_code == 403

        cancel_payload = {"status": "CANCELED"}
        cancel_response_b = client.patch(f"/api/orders/{order_id}", json=cancel_payload, headers=headers_b)
        assert cancel_response_b.status_code == 403

        cancel_response_a = client.patch(f"/api/orders/{order_id}", json=cancel_payload, headers=headers_a)
        assert cancel_response_a.status_code == 200
        assert cancel_response_a.json()["status"] == "CANCELED"

    def test_order_create_nonexistent_restaurant_returns_404(self, client, db):
        create_payload = {
            "restaurant_id": 9999,
            "table_id": None,
            "reservation_id": None,
            "order_source": "KIOSK",
            "items": [
                {
                    "menu_item_id": 1,
                    "quantity": 1,
                    "customization_notes": None
                }
            ]
        }

        response = client.post("/api/orders", json=create_payload)
        assert response.status_code == 404
        assert "Restaurant" in response.json()["detail"]

    def test_order_create_unavailable_menu_item_returns_400(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)

        mi = get_menu_item_for_restaurant(db, restaurant.restaurant_id)
        mi.is_available = False
        db.commit()

        create_payload = {
            "restaurant_id": restaurant.restaurant_id,
            "table_id": None,
            "reservation_id": None,
            "order_source": "KIOSK",
            "items": [
                {
                    "menu_item_id": mi.menu_item_id,
                    "quantity": 1,
                    "customization_notes": None
                }
            ]
        }

        response = client.post("/api/orders", json=create_payload)
        assert response.status_code == 400
        assert "not available" in response.json()["detail"]

    def test_order_invalid_status_transition_returns_400(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)
        create_tables(db, restaurant.restaurant_id)
        user = create_user(db)

        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        table = get_table_for_restaurant(db, restaurant.restaurant_id)
        menu_item = get_menu_item_for_restaurant(db, restaurant.restaurant_id)

        create_payload = {
            "restaurant_id": restaurant.restaurant_id,
            "table_id": table.table_id,
            "reservation_id": None,
            "order_source": "QR_TABLE",
            "items": [
                {
                    "menu_item_id": menu_item.menu_item_id,
                    "quantity": 1,
                    "customization_notes": None
                }
            ]
        }

        create_response = client.post("/api/orders", json=create_payload, headers=headers)
        assert create_response.status_code == 201
        order_id = create_response.json()["order_id"]

        invalid_payload = {"status": "IN_PREPARATION"}
        patch_response = client.patch(f"/api/orders/{order_id}", json=invalid_payload, headers=headers)
        assert patch_response.status_code in [400, 403]

    def test_get_my_orders_pagination(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)
        create_tables(db, restaurant.restaurant_id)
        user = create_user(db)

        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        table = get_table_for_restaurant(db, restaurant.restaurant_id)
        menu_item = get_menu_item_for_restaurant(db, restaurant.restaurant_id)

        for i in range(3):
            create_payload = {
                "restaurant_id": restaurant.restaurant_id,
                "table_id": table.table_id,
                "reservation_id": None,
                "order_source": "QR_TABLE",
                "items": [
                    {
                        "menu_item_id": menu_item.menu_item_id,
                        "quantity": 1,
                        "customization_notes": None
                    }
                ]
            }
            resp = client.post("/api/orders", json=create_payload, headers=headers)
            assert resp.status_code == 201

        response = client.get("/api/orders/my?page=1&size=2", headers=headers)
        assert response.status_code == 200

        data = response.json()
        assert data["total"] == 3
        assert len(data["items"]) == 2
        assert data["page"] == 1
        assert data["size"] == 2
        assert data["pages"] == 2

    def test_order_full_lifecycle_status_transitions(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)
        create_tables(db, restaurant.restaurant_id)
        user = create_user(db)

        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        db_user = db.get(AppUser, user.user_id)
        db_user.role = UserRoleEnum.WAITER
        db.commit()

        table = get_table_for_restaurant(db, restaurant.restaurant_id)
        menu_item = get_menu_item_for_restaurant(db, restaurant.restaurant_id)

        create_payload = {
            "restaurant_id": restaurant.restaurant_id,
            "table_id": table.table_id,
            "reservation_id": None,
            "order_source": "QR_TABLE",
            "items": [
                {
                    "menu_item_id": menu_item.menu_item_id,
                    "quantity": 1,
                    "customization_notes": None
                }
            ]
        }

        create_response = client.post("/api/orders", json=create_payload, headers=headers)
        assert create_response.status_code == 201
        order_id = create_response.json()["order_id"]
        assert create_response.json()["status"] == "NEW"

        resp = client.patch(f"/api/orders/{order_id}", json={"status": "PAID"}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "PAID"

        resp = client.patch(f"/api/orders/{order_id}", json={"status": "IN_PREPARATION"}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "IN_PREPARATION"

        resp = client.patch(f"/api/orders/{order_id}", json={"status": "READY"}, headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "READY"

    def test_get_restaurant_orders_requires_staff_role(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)
        create_tables(db, restaurant.restaurant_id)
        user = create_user(db)

        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get(f"/api/orders/restaurant/{restaurant.restaurant_id}", headers=headers)
        assert response.status_code == 403

        response_no_auth = client.get(f"/api/orders/restaurant/{restaurant.restaurant_id}")
        assert response_no_auth.status_code == 401

    def test_cross_restaurant_waiter_bola(self, client, db):
        restaurant_a = create_restaurants(db)
        
        restaurant_b = create_restaurants(db)
        restaurant_b.name = "Restaurant B"
        db.commit()

        waiter = AppUser(
            email="waiter_a@example.com",
            password_hash=PasswordHandler.hash_password("password123"),
            first_name="Jane",
            surname="Waiter",
            role=UserRoleEnum.WAITER
        )
        db.add(waiter)
        db.commit()

        assign_user_to_restaurant(db, waiter.user_id, restaurant_a.restaurant_id)

        login_response = client.post("/api/auth/login", json={
            "email": "waiter_a@example.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get(f"/api/orders/restaurant/{restaurant_b.restaurant_id}", headers=headers)
        assert response.status_code == 403

        response_ok = client.get(f"/api/orders/restaurant/{restaurant_a.restaurant_id}", headers=headers)
        assert response_ok.status_code == 200

    def test_unauthorized_reservation_hijacking_blocked(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)
        create_tables(db, restaurant.restaurant_id)
        user_owner = create_user(db)
        
        user_attacker = AppUser(
            email="attacker@example.com",
            password_hash=PasswordHandler.hash_password("password123"),
            first_name="Malicious",
            surname="User"
        )
        db.add(user_attacker)
        db.commit()

        table = get_table_for_restaurant(db, restaurant.restaurant_id)
        menu_item = get_menu_item_for_restaurant(db, restaurant.restaurant_id)

        res = Reservation(
            user_id=user_owner.user_id,
            restaurant_id=restaurant.restaurant_id,
            table_id=table.table_id,
            reservation_time=datetime.now(),
            status=ReservationStatusEnum.CONFIRMED
        )
        db.add(res)
        db.commit()

        login_response = client.post("/api/auth/login", json={
            "email": "attacker@example.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "restaurant_id": restaurant.restaurant_id,
            "table_id": table.table_id,
            "reservation_id": res.reservation_id,
            "order_source": "QR_TABLE",
            "items": [
                {
                    "menu_item_id": menu_item.menu_item_id,
                    "quantity": 1
                }
            ]
        }
        response = client.post("/api/orders", json=payload, headers=headers)
        assert response.status_code == 403

    def test_order_cancel_endpoint(self, client, db):
        restaurant = create_restaurants(db)
        create_menu(db)
        create_tables(db, restaurant.restaurant_id)
        user = create_user(db)

        table = get_table_for_restaurant(db, restaurant.restaurant_id)
        menu_item = get_menu_item_for_restaurant(db, restaurant.restaurant_id)

        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "restaurant_id": restaurant.restaurant_id,
            "table_id": table.table_id,
            "reservation_id": None,
            "order_source": "QR_TABLE",
            "items": [
                {
                    "menu_item_id": menu_item.menu_item_id,
                    "quantity": 1
                }
            ]
        }
        create_response = client.post("/api/orders", json=payload, headers=headers)
        assert create_response.status_code == 201
        order_id = create_response.json()["order_id"]

        cancel_response = client.patch(f"/api/orders/{order_id}/cancel", headers=headers)
        assert cancel_response.status_code == 200
        assert cancel_response.json()["status"] == "CANCELED"

