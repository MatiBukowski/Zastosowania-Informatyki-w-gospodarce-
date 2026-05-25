import pytest
from datetime import datetime, timedelta, timezone
from tests.utils import create_restaurants, create_user, create_tables
from src.models import ReservationStatusEnum

class TestReservationDataflow:

    def test_reservation_lifecycle(self, client, db):
        create_restaurants(db)
        create_user(db)
        create_tables(db, restaurant_id=1)
        
        table_id = 1
        user_id = 1
        res_time = (datetime.now(timezone.utc) + timedelta(days=40)).isoformat()
        
        payload = {
            "user_id": user_id,
            "restaurant_id": 1,
            "table_id": table_id,
            "reservation_time": res_time,
            "status": ReservationStatusEnum.PENDING
        }
        
        response = client.post(f"/api/tables/{table_id}/reservation", json=payload, headers={"X-Forwarded-For": "192.168.1.102"})
        assert response.status_code == 200
        data = response.json()
        assert data["table_id"] == table_id
        assert data["status"] == ReservationStatusEnum.PENDING
        reservation_id = data["reservation_id"]
        
        response = client.get(f"/api/reservations/{reservation_id}")
        assert response.status_code == 200
        assert response.json()["reservation_id"] == reservation_id
        
        patch_payload = {"status": ReservationStatusEnum.CONFIRMED}
        response = client.patch(f"/api/reservations/{reservation_id}", json=patch_payload)
        assert response.status_code == 200
        assert response.json()["status"] == ReservationStatusEnum.CONFIRMED
        
        response = client.get(f"/api/reservations/{reservation_id}")
        assert response.status_code == 200
        assert response.json()["status"] == ReservationStatusEnum.CONFIRMED

    def test_reservation_not_found(self, client, db):
        response = client.get("/api/reservations/99999")
        assert response.status_code == 404

    def test_reservation_window_collision_logic(self, client, db):
        create_restaurants(db)
        create_user(db)
        create_tables(db, restaurant_id=1)
        
        base_time = datetime.now(timezone.utc) + timedelta(days=20)
        res_time_1 = base_time.isoformat()
        res_time_2 = (base_time + timedelta(hours=1)).isoformat()
        res_time_3 = (base_time + timedelta(hours=3)).isoformat()

        payload = {
            "user_id": 1,
            "restaurant_id": 1,
            "table_id": 1,
            "reservation_time": res_time_1,
            "status": ReservationStatusEnum.PENDING
        }
        headers = {"X-Forwarded-For": "192.168.1.101"}
        resp = client.post("/api/tables/1/reservation", json=payload, headers=headers)
        assert resp.status_code == 200

        payload_collision = payload.copy()
        payload_collision["reservation_time"] = res_time_2
        resp_col = client.post("/api/tables/1/reservation", json=payload_collision, headers=headers)
        assert resp_col.status_code == 409

        payload_ok = payload.copy()
        payload_ok["reservation_time"] = res_time_3
        resp_ok = client.post("/api/tables/1/reservation", json=payload_ok, headers=headers)
        assert resp_ok.status_code == 200

    def test_canceled_reservation_does_not_block(self, client, db):
        create_restaurants(db)
        create_user(db)
        create_tables(db, restaurant_id=1)
        res_time = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

        payload = {
            "user_id": 1,
            "restaurant_id": 1,
            "table_id": 1,
            "reservation_time": res_time,
            "status": ReservationStatusEnum.PENDING
        }
        headers = {"X-Forwarded-For": "192.168.1.100"}
        resp = client.post("/api/tables/1/reservation", json=payload, headers=headers)
        assert resp.status_code == 200
        reservation_id = resp.json()["reservation_id"]
        
        patch_resp = client.patch(f"/api/reservations/{reservation_id}", json={"status": ReservationStatusEnum.CANCELED})
        assert patch_resp.status_code == 200

        resp_retry = client.post("/api/tables/1/reservation", json=payload, headers=headers)
        assert resp_retry.status_code == 200

    def test_get_my_reservations_success(self, client, db):
        create_restaurants(db)
        
        # 1. Create a user (User 1) and register to get their token
        user1_payload = {
            "email": "user1@example.com",
            "password": "password123",
            "first_name": "User",
            "surname": "One"
        }
        resp = client.post("/api/auth/register", json=user1_payload)
        assert resp.status_code == 201
        token1 = resp.json()["access_token"]
        
        # 2. Create another user (User 2) and get their token
        user2_payload = {
            "email": "user2@example.com",
            "password": "password123",
            "first_name": "User",
            "surname": "Two"
        }
        resp = client.post("/api/auth/register", json=user2_payload)
        assert resp.status_code == 201
        token2 = resp.json()["access_token"]
        
        create_tables(db, restaurant_id=1)
        
        # Create a reservation for User 1
        res_time_1 = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
        payload_1 = {
            "user_id": 1,
            "restaurant_id": 1,
            "table_id": 1,
            "reservation_time": res_time_1,
            "status": ReservationStatusEnum.PENDING
        }
        resp = client.post("/api/tables/1/reservation", json=payload_1)
        assert resp.status_code == 200
        
        # Create another reservation for User 1
        res_time_2 = (datetime.now(timezone.utc) + timedelta(days=15)).isoformat()
        payload_2 = {
            "user_id": 1,
            "restaurant_id": 1,
            "table_id": 1,
            "reservation_time": res_time_2,
            "status": ReservationStatusEnum.PENDING
        }
        resp = client.post("/api/tables/1/reservation", json=payload_2)
        assert resp.status_code == 200
        
        # Create a reservation for User 2
        res_time_3 = (datetime.now(timezone.utc) + timedelta(days=25)).isoformat()
        payload_3 = {
            "user_id": 2,
            "restaurant_id": 1,
            "table_id": 1,
            "reservation_time": res_time_3,
            "status": ReservationStatusEnum.PENDING
        }
        resp = client.post("/api/tables/1/reservation", json=payload_3)
        assert resp.status_code == 200
        
        # 3. Call GET /api/reservations/me without credentials -> should be 401
        resp = client.get("/api/reservations/me")
        assert resp.status_code == 401
        
        # 4. Call GET /api/reservations/me with User 1 token -> should return User 1's 2 reservations
        headers1 = {"Authorization": f"Bearer {token1}"}
        resp = client.get("/api/reservations/me", headers=headers1)
        assert resp.status_code == 200
        data1 = resp.json()
        assert len(data1) == 2
        for res in data1:
            assert res["user_id"] == 1
            
        # 5. Call GET /api/reservations/me with User 2 token -> should return User 2's 1 reservation
        headers2 = {"Authorization": f"Bearer {token2}"}
        resp = client.get("/api/reservations/me", headers=headers2)
        assert resp.status_code == 200
        data2 = resp.json()
        assert len(data2) == 1
        assert data2[0]["user_id"] == 2

