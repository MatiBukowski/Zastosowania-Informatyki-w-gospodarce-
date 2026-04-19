from tests.utils import create_user


class TestUserDataflow:

    def test_register_user_success_flow(self, client):
        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
            "first_name": "John",
            "surname": "Doe"
        })

        assert response.status_code == 201
        assert "access_token" in response.json()
        assert response.cookies.get("refresh_token") is not None


    def test_register_user_existing_email_flow(self, client, db):
        create_user(db)

        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "password123",
            "first_name": "Jane",
            "surname": "Doe"
        })

        assert response.status_code == 409
        assert "access_token" not in response.json()
        assert response.cookies.get("refresh_token") is None


    def test_login_user_success_flow(self, client, db):
        create_user(db)

        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })

        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.cookies.get("refresh_token") is not None


    def test_login_user_not_found_flow(self, client, db):
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "password123"
        })

        assert response.status_code == 404
        assert "access_token" not in response.json()
        assert response.cookies.get("refresh_token") is None


    def test_login_user_invalid_creds_flow(self, client, db):
        create_user(db)

        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })

        assert response.status_code == 401
        assert "access_token" not in response.json()
        assert response.cookies.get("refresh_token") is None