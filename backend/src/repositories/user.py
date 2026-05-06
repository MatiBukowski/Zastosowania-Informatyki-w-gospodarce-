from fastapi import Depends
from pytest import Session

from src.models.app_user import AppUser
from src.db import get_session

class UserRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_by_email(self, email):
        return self.db.query(AppUser).filter_by(email=email).first()

    def get_by_id(self, user_id: int):
        return self.db.query(AppUser).filter(AppUser.user_id == user_id).first()

    def create(self, user: AppUser):
        self.db.add(user)
        self.db.commit()
        return user
