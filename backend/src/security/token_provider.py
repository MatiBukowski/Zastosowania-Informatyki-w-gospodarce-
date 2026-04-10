import jwt, secrets, logging
from datetime import datetime, timedelta, timezone


from ..models.app_user import AppUser
from ..models.enums import UserRoleEnum


class TokenProvider:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.secret_key = self._generate_secret_key()
        self.jwt_key = jwt.jwk.OctetJWK(self.secret_key.encode())
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        self.REFRESH_TOKEN_EXPIRE_DAYS = 30
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
                "exp": int(expiry_date.timestamp())
            }

            return self.jwt_handler.encode(payload, self.jwt_key, alg="HS256")
        except jwt.exceptions.JWTEncodeError as e:
            self.logger.error(f"Error encoding access token: {str(e)}")
            raise Exception(f"Failed to generate access token: {str(e)}")
    

    def generate_access_token_from_refresh_token(self, refresh_token: str) -> str:
        try:
            self.logger.debug(f"Generating access token from refresh token for token={refresh_token}")

            payload = self.jwt_handler.decode(refresh_token, self.jwt_key, algorithms=["HS256"])
            self.logger.debug(f"Decoded user: {payload.get('user_id')}, email: {payload.get('email')}, role: {payload.get('role')}")

            user_id = payload.get("user_id")
            email = payload.get("email")
            role_str = payload.get("role")
            role = UserRoleEnum(role_str)

            return self.generate_access_token(AppUser(user_id=user_id, email=email, role=role))
        except jwt.exceptions.JWTDecodeError as e:
            self.logger.error(f"Error decoding refresh token: {str(e)}")
            raise Exception(f"Invalid or expired refresh token: {str(e)}")
        
    
    def generate_refresh_token(self, user: AppUser) -> str:
        try:
            self.logger.debug(f"Generating refresh token for user_id={user.user_id}, email={user.email}, role={user.role}")

            expiry_date = datetime.now(timezone.utc) + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)
            payload = {
                "user_id": user.user_id,
                "email": user.email,
                "role": user.role.value,
                "exp": int(expiry_date.timestamp())
            }
            
            return self.jwt_handler.encode(payload, self.jwt_key, alg="HS256")
        except jwt.exceptions.JWTEncodeError as e:
            self.logger.error(f"Error encoding refresh token: {str(e)}")
            raise Exception(f"Failed to generate refresh token: {str(e)}")