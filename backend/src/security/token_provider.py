import jwt
import secrets
from datetime import datetime, timedelta, timezone

from ..models.app_user import AppUser
from ..models.enums import UserRoleEnum


class TokenProvider:
    def __init__(self):
        self.secret_key = self._generate_secret_key()
        self.jwt_key = jwt.jwk.OctetJWK(self.secret_key.encode())
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        self.REFRESH_TOKEN_EXPIRE_DAYS = 30
        self.jwt_handler = jwt.JWT()


    @staticmethod
    def _generate_secret_key() -> str:
        return secrets.token_urlsafe(32)
    
    
    def generate_access_token(self, user: AppUser) -> str:
        expiry_date = datetime.now(timezone.utc) + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role.value,
            "exp": int(expiry_date.timestamp())
        }
        return self.jwt_handler.encode(payload, self.jwt_key, alg="HS256")
    

    def generate_access_token_from_refresh_token(self, refresh_token: str) -> str:
        try:
            payload = self.jwt_handler.decode(refresh_token, self.jwt_key, algorithms=["HS256"])
            user_id = payload.get("user_id")
            email = payload.get("email")
            role_str = payload.get("role")
            role = UserRoleEnum(role_str)
            return self.generate_access_token(AppUser(user_id=user_id, email=email, role=role))
        except jwt.exceptions.JWTDecodeError as e:
            raise Exception(f"Invalid or expired refresh token: {str(e)}")
        
    
    def generate_refresh_token(self, user: AppUser) -> str:
        expiry_date = datetime.now(timezone.utc) + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role.value,
            "exp": int(expiry_date.timestamp())
        }
        return self.jwt_handler.encode(payload, self.jwt_key, alg="HS256")