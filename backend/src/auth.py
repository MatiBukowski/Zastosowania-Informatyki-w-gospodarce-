from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from fastapi import Depends
from src.repositories import UserRepository
from src.exceptions import UserNotFoundException, InvalidCredentialsException
from src.config import settings

jwt_handler = jwt.JWT()
jwt_key = jwt.jwk.OctetJWK(settings.JWT_SECRET.encode())
auth_scheme = HTTPBearer()

def get_current_user(auth: HTTPAuthorizationCredentials = Depends(auth_scheme), repo: UserRepository = Depends()):
    token = auth.credentials
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
