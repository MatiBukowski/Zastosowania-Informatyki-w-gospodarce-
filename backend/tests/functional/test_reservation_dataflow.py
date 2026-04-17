import pytest
from datetime import datetime, timedelta, UTC
from tests.utils import create_restaurants, create_users, create_tables
from src.models import ReservationStatusEnum

class TestReservationDataflow:

    def test_reservation_lifecycle(self, client, db):
        create_restaurants(db)
        create_users(db)
        create_tables(db, restaurant_id=1)
        
        table_id = 1
        user_id = 1
        res_time = (datetime.now(UTC) + timedelta(days=40)).isoformat()
        
        payload = {
            "user_id": user_id,
            "restaurant_id": 1,
            "table_id": table_id,
            "reservation_time": res_time,
            "status": ReservationStatusEnum.PENDING
        }
        
        response = client.post(f"/api/tables/{table_id}/reservation", json=payload)
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
        
        response = client.post(f"/api/tables/{table_id}/reservation", json=payload)
        assert response.status_code == 409
        assert "Table is already reserved" in response.json()["detail"]

    def test_reservation_not_found(self, client, db):
        response = client.get("/api/reservations/999")
        assert response.status_code == 404

    def test_reservation_window_collision_logic(self, client, db):
        create_restaurants(db)
        create_users(db)
        create_tables(db, restaurant_id=1)
        
        base_time = datetime.now(UTC) + timedelta(days=20)
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
        client.post("/api/tables/1/reservation", json=payload)

        payload_collision = payload.copy()
        payload_collision["reservation_time"] = res_time_2
        resp_col = client.post("/api/tables/1/reservation", json=payload_collision)
        assert resp_col.status_code == 409
        assert "2h window collision" in resp_col.json()["detail"]

        payload_ok = payload.copy()
        payload_ok["reservation_time"] = res_time_3
        resp_ok = client.post("/api/tables/1/reservation", json=payload_ok)
        assert resp_ok.status_code == 200

    def test_canceled_reservation_does_not_block(self, client, db):
        create_restaurants(db)
        create_users(db)
        create_tables(db, restaurant_id=1)
        res_time = (datetime.now(UTC) + timedelta(days=30)).isoformat()

        payload = {
            "user_id": 1,
            "restaurant_id": 1,
            "table_id": 1,
            "reservation_time": res_time,
            "status": ReservationStatusEnum.PENDING
        }
        res_resp = client.post("/api/tables/1/reservation", json=payload).json()
        reservation_id = res_resp["reservation_id"]
        
        client.patch(f"/api/reservations/{reservation_id}", json={"status": ReservationStatusEnum.CANCELED})

        resp = client.post("/api/tables/1/reservation", json=payload)
        assert resp.status_code == 200
