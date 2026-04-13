from tests.utils import create_restaurants
from src.models import TableStatusEnum


class TestTableDataflow:

    def test_create_update_table(self, client, db):
        restaurant_id = 1
        create_payload = {
            "table_number": 15,
            "capacity": 4,
            "status": "FREE"
        }
        create_response = client.post(f"/api/restaurants/{restaurant_id}/tables", json=create_payload)

        assert create_response.status_code == 200

        created_data = create_response.json()
        assert isinstance(created_data, dict)
        table_id = 1
        if len(created_data) > 0:
            table = created_data
            assert "table_id" in table
            assert "restaurant_id" in table
            assert "table_number" in table
            assert "qr_code_token" in table
            assert "capacity" in table
            assert "status" in table
            assert table["table_number"] == 15
            assert table["capacity"] == 4
            assert table["restaurant_id"] == restaurant_id
            table_id = created_data["table_id"]

        update_payload = {
            "table_number": 10,
            "capacity": 5
        }
        update_response = client.patch(f"/api/restaurants/{restaurant_id}/tables/{table_id}", json=update_payload)

        assert update_response.status_code == 200

        updated_data = update_response.json()
        assert isinstance(updated_data, dict)
        if len(updated_data) > 0:
            table = updated_data
            assert table["table_number"] == 10
            assert table["capacity"] == 5
            assert table["restaurant_id"] == restaurant_id
            assert table["status"] == TableStatusEnum.FREE

    def test_regenerate_resolve_qr_code_token(self, client, db):
        restaurant_id = 1
        create_payload = {
            "table_number": 15,
            "capacity": 4,
            "status": "FREE"
        }
        create_response = client.post(f"/api/restaurants/{restaurant_id}/tables", json=create_payload)
        created_data = create_response.json()

        table_id = created_data["table_id"]
        old_qr_code_token = created_data["qr_code_token"]

        regenerate_response = client.patch(f"/api/restaurants/{restaurant_id}/tables/{table_id}/regenerate-qr-code")
        assert regenerate_response.status_code == 200

        regenerated_data = regenerate_response.json()
        new_qr_code_token = regenerated_data["qr_code_token"]

        assert isinstance(regenerated_data, dict)
        assert new_qr_code_token != old_qr_code_token
        assert regenerated_data["table_id"] == table_id
        assert regenerated_data["table_number"] == 15

        resolve_response = client.get(f"/api/tables/resolve/{new_qr_code_token}")
        assert resolve_response.status_code == 200

        resolved_data = resolve_response.json()
        assert isinstance(resolved_data, dict)
        assert resolved_data == regenerated_data
