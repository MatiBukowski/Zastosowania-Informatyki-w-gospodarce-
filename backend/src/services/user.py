from fastapi import Depends

from src.schemas.user import UserLoginRequest, UserRegisterRequest
from src.models import AppUser
from src.repositories import UserRepository
from src.exceptions import UserAlreadyExistsException, UserNotFoundException, InvalidCredentialsException
from src.security import PasswordHandler
from ..middleware.posthog import posthog


class UserService:

    def __init__(self, user_repository: UserRepository = Depends()):
        self.user_repository = user_repository

    def register_user(self, user: UserRegisterRequest):
        existing_user = self.user_repository.get_by_email(user.email)
        if existing_user:
            raise UserAlreadyExistsException(f"User with email {user.email} already exists")

        hashed_password = PasswordHandler.hash_password(user.password)

        new_user = self.user_repository.create(AppUser(
            email=user.email,
            password_hash=hashed_password,
            first_name=user.first_name,
            surname=user.surname
        ))

        posthog.capture(
            distinct_id=f"user_{new_user.user_id}",
            event="user_registered",
            properties={
                "email": new_user.email,
                "first_name": new_user.first_name,
                "surname": new_user.surname
            }
        )

        return new_user

    def login_user(self, user: UserLoginRequest):
        existing_user = self.user_repository.get_by_email(user.email)

        if not existing_user:
            raise UserNotFoundException(f"User with email {user.email} not found")
        
        if PasswordHandler.verify_password(user.password, existing_user.password_hash):
            return existing_user
        else:
            raise InvalidCredentialsException("Invalid email or password")
