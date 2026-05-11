import pytest
from unittest.mock import MagicMock, patch

from src.exceptions import InvalidCredentialsException, UserAlreadyExistsException, UserNotFoundException
from src.schemas.user import UserLoginRequest, UserRegisterRequest
from src.services import UserService
from src.models import AppUser

@pytest.fixture
def sample_user():
    return AppUser(
        email="test@example.com",
        password_hash="password123",
        first_name="John",
        surname="Doe"
    )

class TestUserService:

    def test_register_user_success(self, sample_user):
        mock_repo = MagicMock()
        mock_repo.get_by_email.return_value = None
        mock_repo.create.return_value = sample_user

        service = UserService(user_repository=mock_repo)
        register_request = UserRegisterRequest(
            email=sample_user.email,
            password="password123",
            first_name=sample_user.first_name,
            surname=sample_user.surname
        )

        result = service.register_user(register_request)

        assert result == sample_user
        mock_repo.get_by_email.assert_called_with(register_request.email)
        mock_repo.create.assert_called_once()
        
        created_user = mock_repo.create.call_args[0][0]
        assert created_user.email == register_request.email
        assert created_user.first_name == register_request.first_name
        assert created_user.surname == register_request.surname

    def test_register_user_already_exists(self, sample_user):
        mock_repo = MagicMock()
        mock_repo.get_by_email.return_value = sample_user

        service = UserService(user_repository=mock_repo)
        register_request = UserRegisterRequest(
            email=sample_user.email,
            password="password123",
            first_name=sample_user.first_name,
            surname=sample_user.surname
        )

        with pytest.raises(UserAlreadyExistsException):
            service.register_user(register_request)

        mock_repo.get_by_email.assert_called_with(register_request.email)

    def test_login_user_success(self, sample_user):
        mock_repo = MagicMock()
        mock_repo.get_by_email.return_value = sample_user

        service = UserService(user_repository=mock_repo)
        login_request = UserLoginRequest(
            email=sample_user.email,
            password="password123"
        )

        with patch('src.security.password_handler.PasswordHandler.verify_password', return_value=True):
            result = service.login_user(login_request)

        assert result == sample_user
        mock_repo.get_by_email.assert_called_with(login_request.email)

    def test_login_user_not_found(self):
        mock_repo = MagicMock()
        mock_repo.get_by_email.return_value = None

        service = UserService(user_repository=mock_repo)
        login_request = UserLoginRequest(
            email="nonexistent@example.com",
            password="password123"
        )

        with pytest.raises(UserNotFoundException):
            service.login_user(login_request)

        mock_repo.get_by_email.assert_called_with(login_request.email)

    def test_login_user_invalid_password(self, sample_user):
        mock_repo = MagicMock()
        mock_repo.get_by_email.return_value = sample_user

        service = UserService(user_repository=mock_repo)
        login_request = UserLoginRequest(
            email=sample_user.email,
            password="wrongpassword"
        )

        with patch('src.security.password_handler.PasswordHandler.verify_password', return_value=False):
            with pytest.raises(InvalidCredentialsException):
                service.login_user(login_request)

        mock_repo.get_by_email.assert_called_with(login_request.email)