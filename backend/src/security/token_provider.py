import jwt, secrets, logging
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status

from src.models import AppUser
from src.models import UserRoleEnum
from src.config import settings
from src.exceptions import JWTHandlingException, UnauthorisedUserException, UserNotFoundException
from src.db import get_session
from sqlalchemy.orm import Session
from sqlalchemy import select

class TokenProvider:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.secret_key = settings.JWT_SECRET
        self.jwt_key = jwt.jwk.OctetJWK(self.secret_key.encode())
        self.ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
        self.jwt_handler = jwt.JWT()


    @staticmethod
    def _generate_secret_key() -> str:
        return secrets.token_urlsafe(32)
    

    def generate_access_token(self, user: AppUser) -> str:
        try:
            self.logger.debug(f"Generating access token for user_id={user.user_id}, email={user.email}, role={user.role}")

            expiry_date = datetime.now(timezone.utc) + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
            payload = {
                "user_id": user.user_id,
                "email": user.email,
                "role": user.role.value,
                "first_name": user.first_name,
                "surname": user.surname,
                "exp": int(expiry_date.timestamp())
            }

            return self.jwt_handler.encode(payload, self.jwt_key, alg="HS256")
        except jwt.exceptions.JWTEncodeError as e:
            self.logger.error(f"Error encoding access token: {str(e)}")
            raise JWTHandlingException(f"Failed to generate access token: {str(e)}")
    

    def generate_access_token_from_refresh_token(self, refresh_token: str) -> str:
        try:
            self.logger.debug(f"Generating access token from refresh token for token={refresh_token}")

            payload = self.jwt_handler.decode(refresh_token, self.jwt_key, algorithms=["HS256"])
            self.logger.debug(f"Decoded user: {payload.get('user_id')}, email: {payload.get('email')}, role: {payload.get('role')}")

            user_id = payload.get("user_id")
            email = payload.get("email")
            role_str = payload.get("role")
            first_name = payload.get("first_name")
            surname = payload.get("surname")
            role = UserRoleEnum(role_str)

            return self.generate_access_token(AppUser(user_id=user_id, email=email, role=role, first_name=first_name, surname=surname))
        except jwt.exceptions.JWTDecodeError as e:
            self.logger.error(f"Error decoding refresh token: {str(e)}")
            raise JWTHandlingException(f"Invalid or expired refresh token: {str(e)}")
        
        
    def generate_refresh_token(self, user: AppUser) -> str:
        try:
            self.logger.debug(f"Generating refresh token for user_id={user.user_id}, email={user.email}, role={user.role}")

            expiry_date = datetime.now(timezone.utc) + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)
            payload = {
                "user_id": user.user_id,
                "email": user.email,
                "role": user.role.value,
                "first_name": user.first_name,
                "surname": user.surname,
                "exp": int(expiry_date.timestamp())
            }
            
            return self.jwt_handler.encode(payload, self.jwt_key, alg="HS256")
        except jwt.exceptions.JWTEncodeError as e:
            self.logger.error(f"Error encoding refresh token: {str(e)}")
            raise JWTHandlingException(f"Failed to generate refresh token: {str(e)}")


    def get_current_user(self, access_token: str) -> AppUser:
        try:
            payload = self.jwt_handler.decode(access_token, self.jwt_key, algorithms=["HS256"])
            user_id: int = payload.get("user_id")
            email: str = payload.get("email")
            role_str: str = payload.get("role")
            first_name: str = payload.get("first_name")
            surname: str = payload.get("surname")

            if user_id is None or email is None or role_str is None:
                raise UnauthorisedUserException(
                    detail="Could not validate credentials",
                    headers={"Authenticate": "Bearer"},
                )

            return AppUser(
                user_id=user_id,
                email=email,
                role=UserRoleEnum(role_str),
                first_name=first_name,
                surname=surname
            )
        except Exception as e:
            raise UnauthorisedUserException(
                detail=f"Could not validate credentials: {str(e)}",
                headers={"Authenticate": "Bearer"},
            )

    def get_current_active_user(self, access_token: str, db: Session = Depends(get_session)) -> AppUser:
        user = db.execute(select(AppUser).where(AppUser.user_id == self.get_current_user(access_token).user_id)).scalar_one_or_none()
        if user is None:
            raise UserNotFoundException("User not found")
        return user