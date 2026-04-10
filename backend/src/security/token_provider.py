import jwt
import secrets
from datetime import datetime, timedelta

from models.app_user import AppUser


class TokenProvider:
    def __init__(self):
        self.secret_key = self._generate_secret_key()
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        self.REFRESH_TOKEN_EXPIRE_DAYS = 30


    @staticmethod
    def _generate_secret_key() -> str:
        return secrets.token_urlsafe(32)
    
    
    def generate_access_token(self, user: AppUser) -> str:
        payload = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role.value,
            "exp": datetime.utcnow() + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")
    
    
    def generate_refresh_token(self, user: AppUser) -> str:
        payload = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role.value,
            "exp": datetime.utcnow() + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")