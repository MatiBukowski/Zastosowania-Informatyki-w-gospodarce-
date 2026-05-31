from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from src.repositories import UserRepository
from src.models import AppUser
from src.exceptions import UserNotFoundException, InvalidCredentialsException 
from src.config import settings

jwt_handler = jwt.JWT()
jwt_key = jwt.jwk.OctetJWK(settings.JWT_SECRET.encode())

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme), 
    repo: UserRepository = Depends()
):
    token = None

    if credentials:
        token = credentials.credentials   
    elif "access_token" in request.cookies: # Upewnij się, że to nazwa Twojego ciastka!
        token = request.cookies.get("access_token")

    if not token:
        raise InvalidCredentialsException("No access token provided")

    try:
        payload = jwt_handler.decode(token, jwt_key, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if user_id is None:
            raise InvalidCredentialsException("Invalid token structure")
    
    except Exception:
        raise InvalidCredentialsException("Invalid credentials")

    user = repo.get_by_id(int(user_id))
    if user is None:
        raise UserNotFoundException("User not found")

    return user


def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme), 
    repo: UserRepository = Depends()
) -> Optional[AppUser]:
    token = None

    if credentials:
        token = credentials.credentials   
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        return None

    try:
        payload = jwt_handler.decode(token, jwt_key, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if user_id is None:
            return None
    except Exception:
        return None

    user = repo.get_by_id(int(user_id))
    if user is None:
        return None
    return user

