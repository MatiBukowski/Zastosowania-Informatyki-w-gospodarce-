from src.security.password_handler import PasswordHandler


class TestPasswordHandler:
    def test_hash_password(self):
        password = "my_secure_password"
        hashed = PasswordHandler.hash_password(password)
        assert hashed != password
        assert isinstance(hashed, str)

    def test_verify_password(self):
        password = "my_secure_password"
        hashed = PasswordHandler.hash_password(password)
        assert PasswordHandler.verify_password(password, hashed) is True
        assert PasswordHandler.verify_password("wrong_password", hashed) is False