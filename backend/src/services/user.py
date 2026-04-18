from fastapi import Depends

from src.models import AppUser
from src.repositories import UserRepository
from src.exceptions import UserAlreadyExistsException

class UserService:
    def __init__(self, user_repository: UserRepository = Depends()):
        self.user_repository = user_repository

    def register_user(self, user: AppUser):
        existing_user = self.user_repository.get_by_email(user.email)
        if existing_user:
            raise UserAlreadyExistsException(f"User with email {user.email} already exists")

        new_user = self.user_repository.create(user)

        return new_user